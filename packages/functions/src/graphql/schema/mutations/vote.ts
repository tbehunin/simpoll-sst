import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { PollType } from '@simpoll-sst/core/common/types';
import { builder } from '../builder';
import { pollType } from '../common/enums';
import { multipleChoiceVoteInput } from '../types/multipleChoicePoll';
import { poll } from '../types/poll';
import { getPollTypeHandler } from '@simpoll-sst/core/handlers/pollRegistry';
import { VoteRequest } from '@simpoll-sst/core/services/types';

export const vote = builder.mutationField('vote', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: voteInput }),
    },
    resolve: async (_parent, { input: { pollId, type, multipleChoice } }, context) => {
      const handler = getPollTypeHandler(type);

      const request: VoteRequest<PollType> = {
        pollId,
        userId: context.currentUserId,
        type,
        vote: handler.parseVoter(multipleChoice),
      };
      PollService.vote(request);
      
      return pollId;
    },
  })
);

export const voteInput = builder.inputType('VoteInput', {
  fields: (t) => ({
    pollId: t.string(),
    type: t.field({ type: pollType }),
    multipleChoice: t.field({ type: multipleChoiceVoteInput, required: false }),
  }),
});
