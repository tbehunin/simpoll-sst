import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { SaveDraftRequest } from '@simpoll-sst/core/services/poll/commands/save-draft/save-draft.types';
import { PollType, VotePrivacy } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { builder } from '../builder';
import { pollType, votePrivacy } from '../common/enums';
import { poll } from '../types/poll';
import { getRegisteredGraphQLPollTypes } from '../poll-types/registry';

export const saveDraft = builder.mutationField('saveDraft', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: saveDraftInput }),
    },
    resolve: async (_parent, args, context) => {
      // Use `any` cast since poll-type-specific fields are dynamic and not in the static TS type.
      const input = args.input as any;
      const { pollId, type, title, sharedWith, votePrivacy: inputVotePrivacy, expireTimestamp } = input;

      const coreHandler = getPollTypeHandler(type);

      // Collect all registered detail fields and get the one that was provided (if any)
      const allDetailInputs = getRegisteredGraphQLPollTypes().map((h) => input[h.fieldName]);
      const nonNullItems = allDetailInputs.filter(item => item !== null && item !== undefined);
      const rawDetails = nonNullItems.length === 1 ? nonNullItems[0] : undefined;

      // Parse details if provided (lenient validation happens in command)
      const parsedDetails = rawDetails 
        ? coreHandler.parseDetails(rawDetails, context.currentUserId)
        : undefined;

      const request: SaveDraftRequest<PollType> = {
        pollId: pollId || undefined,
        userId: context.currentUserId,
        type,
        title: title || undefined,
        expireTimestamp: expireTimestamp || undefined,
        sharedWith: sharedWith || undefined,
        votePrivacy: inputVotePrivacy || undefined,
        details: parsedDetails,
      };

      return PollService.saveDraft(request);
    },
  })
);

export const saveDraftInput = builder.inputType('SaveDraftInput', {
  // Dynamic poll-type fields are spread in at schema-build time from the registry.
  // TypeScript sees the return as `any` so that the static fields above remain typed normally.
  fields: (t): any => ({
    pollId: t.string({ required: false }),
    type: t.field({ type: pollType }),
    title: t.string({ required: false }),
    sharedWith: t.stringList({ required: false }),
    votePrivacy: t.field({ type: votePrivacy, required: false }),
    expireTimestamp: t.string({ required: false }),

    // Poll-type-specific detail fields are added dynamically
    ...Object.fromEntries(
      getRegisteredGraphQLPollTypes().map((h) => [
        h.fieldName,
        t.field({ type: h.detailInput, required: false }),
      ])
    ),
  }),
});
