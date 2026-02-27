import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { SavePollRequest } from '@simpoll-sst/core/services/poll/commands/save-poll/save-poll.types';
import { PollScope, PollType, VotePrivacy } from '@simpoll-sst/core/common';
import { calculatePollScope } from '@simpoll-sst/core/services/utils';
import { ValidationError } from '@simpoll-sst/core/errors';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { builder } from '../builder';
import { pollType, votePrivacy } from '../common/enums';
import { poll } from '../types/poll';
import { getRegisteredGraphQLPollTypes } from '../poll-types/registry';

function getSingleNonNullItem<T>(items: (T | null | undefined)[]): T | undefined {
  const nonNullItems = items.filter(item => item !== null && item !== undefined);
  if (nonNullItems.length === 0) return undefined;
  if (nonNullItems.length === 1) return nonNullItems[0];
  throw new ValidationError(`Expected at most one detail type, but got ${nonNullItems.length}`);
}

export const savePoll = builder.mutationField('savePoll', (t) =>
  t.field({
    type: poll,
    args: { input: t.arg({ type: savePollInput }) },
    resolve: async (_parent, args, context) => {
      const input = args.input as any;
      const { pollId, type, title, sharedWith, votePrivacy: inputVotePrivacy, expireTimestamp, publish } = input;
      
      const coreHandler = getPollTypeHandler(type);
      const allDetailInputs = getRegisteredGraphQLPollTypes().map((h) => input[h.fieldName]);
      const rawDetails = getSingleNonNullItem(allDetailInputs);
      
      let parsedDetails: any = undefined;
      if (rawDetails) {
        const validationResult = coreHandler.getDetailSchema().safeParse(rawDetails);
        if (!validationResult.success) {
          throw new ValidationError(validationResult.error.issues.map((e: any) => e.message).join(', '));
        }
        parsedDetails = coreHandler.parseDetails(rawDetails, context.currentUserId);
      }
      
      let finalVotePrivacy: VotePrivacy | undefined = inputVotePrivacy;
      
      // If publishing with sharedWith, override vote privacy for public polls
      if (publish && sharedWith !== undefined) {
        const scope = calculatePollScope(sharedWith, true);
        if (scope === PollScope.Public) {
          finalVotePrivacy = VotePrivacy.Anonymous;
        }
      }
      
      const request: SavePollRequest<PollType> = {
        pollId: pollId || undefined,
        userId: context.currentUserId,
        type,
        publish,
        title: title || undefined,
        expireTimestamp: expireTimestamp || undefined,
        sharedWith: sharedWith || undefined,
        votePrivacy: finalVotePrivacy,
        details: parsedDetails,
      };
      
      return PollService.savePoll(request);
    },
  })
);

export const savePollInput = builder.inputType('SavePollInput', {
  fields: (t): any => ({
    pollId: t.string({ required: false }),
    type: t.field({ type: pollType }),
    publish: t.boolean(),
    title: t.string({ required: false }),
    sharedWith: t.stringList({ required: false }),
    votePrivacy: t.field({ type: votePrivacy, required: false }),
    expireTimestamp: t.string({ required: false }),
    ...Object.fromEntries(
      getRegisteredGraphQLPollTypes().map((h) => [
        h.fieldName, t.field({ type: h.detailInput, required: false }),
      ])
    ),
  }),
});
