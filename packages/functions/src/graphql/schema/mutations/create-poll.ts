import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { CreatePollRequest } from '@simpoll-sst/core/services/poll/commands/create-poll/create-poll.types';
import { PollScope, PollType, VotePrivacy } from '@simpoll-sst/core/common';
import { generatePollScope } from '@simpoll-sst/core/services/utils';
import { ValidationError } from '@simpoll-sst/core/errors';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { builder } from '../builder';
import { pollType, votePrivacy } from '../common/enums';
import { poll } from '../types/poll';
import { getRegisteredGraphQLPollTypes } from '../poll-types/registry';

function getSingleNonNullItem<T>(items: (T | null | undefined)[]): T | null {
  const nonNullItems = items.filter(item => item !== null && item !== undefined);
  if (nonNullItems.length === 1) {
    return nonNullItems[0];
  }
  throw new ValidationError(
    nonNullItems.length === 0
      ? 'Poll details are required - provide exactly one detail type'
      : `Expected exactly one detail type, but got ${nonNullItems.length}`
  );
}

export const createPoll = builder.mutationField('createPoll', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: createPollInput }),
    },
    resolve: async (_parent, args, context) => {
      // Use `any` cast since poll-type-specific fields are dynamic and not in the static TS type.
      const input = args.input as any;
      const { type, title, sharedWith, votePrivacy: inputVotePrivacy, expireTimestamp } = input;

      const coreHandler = getPollTypeHandler(type);

      // Collect all registered detail fields and pass exactly the one that was provided.
      const allDetailInputs = getRegisteredGraphQLPollTypes().map((h) => input[h.fieldName]);
      const rawDetails = getSingleNonNullItem(allDetailInputs);

      // Validate raw input with assetIds
      const validationResult = coreHandler.getDetailSchema().safeParse(rawDetails);
      if (!validationResult.success) {
        throw new ValidationError(validationResult.error.errors.map(e => e.message).join(', '));
      }

      const request: CreatePollRequest<PollType> = {
        userId: context.currentUserId,
        type,
        title,
        expireTimestamp: expireTimestamp || undefined,
        sharedWith,
        votePrivacy: generatePollScope(sharedWith) === PollScope.Public ? VotePrivacy.Anonymous : inputVotePrivacy,
        details: coreHandler.parseDetails(rawDetails, context.currentUserId),
      };

      return PollService.createPoll(request);
    },
  })
);

export const createPollInput = builder.inputType('CreatePollInput', {
  // Dynamic poll-type fields are spread in at schema-build time from the registry.
  // TypeScript sees the return as `any` so that the static fields above remain typed normally.
  fields: (t): any => ({
    type: t.field({ type: pollType }),
    title: t.string(),
    sharedWith: t.stringList(),
    votePrivacy: t.field({ type: votePrivacy }),
    expireTimestamp: t.string({ required: false }),
    // One optional field per registered poll type (e.g. multipleChoice, rating, …):
    ...Object.fromEntries(
      getRegisteredGraphQLPollTypes().map((h) => [
        h.fieldName,
        t.field({ type: h.detailInput, required: false }),
      ])
    ),
  }),
});
