import { pollService } from '@simpoll-sst/core/services/pollService';
import { PollType } from '@simpoll-sst/core/common/types';
import { PollVote } from '@simpoll-sst/core/models';
import { builder } from '../builder';
import { pollType } from '../common/enums';
import { multipleChoiceVoteInput } from '../types/multipleChoicePoll';
import { poll } from '../types/poll';

export const vote = builder.mutationField('vote', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: voteInput }),
    },
    resolve: async (_parent, { input: { pollId, pollType, multipleChoice } }, context) => {
      let pollVote: PollVote;
      switch (pollType) {
        case PollType.MultipleChoice:
          if (!multipleChoice || !multipleChoice.selectedIndex.length) {
            throw new Error('Missing multiple choice vote details');
          }
          pollVote = { selectedIndex: multipleChoice.selectedIndex };
          break;
        default:
          throw new Error(`Unknown poll type: ${pollType}`);
      }

      // Submit vote
      pollService.vote({
        pollId: pollId,
        userId: context.currentUserId,
        vote: pollVote,
      });
      
      return pollId;
    },
  })
);

export const voteInput = builder.inputType('VoteInput', {
  fields: (t) => ({
    pollId: t.string(),
    pollType: t.field({ type: pollType }),
    multipleChoice: t.field({ type: multipleChoiceVoteInput, required: false }),
  }),
});
