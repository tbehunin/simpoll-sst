import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { CreatePollRequest } from '@simpoll-sst/core/services/poll/types';
import { PollScope, PollType, VotePrivacy } from '@simpoll-sst/core/common/types';
import { generatePollScope } from '@simpoll-sst/core/services/utils';
import { builder } from '../builder';
import { pollType, votePrivacy } from '../common/enums';
import { poll } from '../types/poll';
import { multipleChoiceInput } from '../types/multipleChoicePoll';
import { getPollTypeHandler } from '@simpoll-sst/core/handlers/pollRegistry';

function getSingleNonNullItem<T>(items: (T | null | undefined)[]): T | null {
  const nonNullItems = items.filter(item => item !== null && item !== undefined);
  if (nonNullItems.length === 1) {
    return nonNullItems[0];
  }
  throw new Error(`Expected exactly one non-null item, but got ${nonNullItems.length}`);
}

export const createPoll = builder.mutationField('createPoll', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: createPollInput }),
    },
    resolve: async (_parent, { input: { type, title, sharedWith, votePrivacy, expireTimestamp, multipleChoice } }, context) => {
      const handler = getPollTypeHandler(type);

      const request: CreatePollRequest<PollType> = {
        userId: context.currentUserId,
        type,
        title,
        expireTimestamp: expireTimestamp || undefined,
        sharedWith,
        votePrivacy: generatePollScope(sharedWith) === PollScope.Public ? VotePrivacy.Anonymous : votePrivacy,
        details: handler.parseDetails(getSingleNonNullItem([multipleChoice])),
      };
      return PollService.createPoll(request);
    },
  })
);

export const createPollInput = builder.inputType('CreatePollInput', {
  fields: (t) => ({
    type: t.field({ type: pollType }),
    title: t.string(),
    sharedWith: t.stringList(),
    votePrivacy: t.field({ type: votePrivacy }),
    expireTimestamp: t.string({ required: false }),
    multipleChoice: t.field({ type: multipleChoiceInput, required: false }),
  }),
});
