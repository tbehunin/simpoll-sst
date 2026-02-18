import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { PollType } from '@simpoll-sst/core/common/poll.types';
import { builder } from '../builder';
import { pollType } from '../common/enums';
import { multipleChoiceVoteInput } from '../types/multiple-choice-poll';
import { poll } from '../types/poll';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types/poll-type.registry';
import { VoteRequest } from '@simpoll-sst/core/services/poll/commands/vote/vote.types';

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
        vote: handler.parseParticipant(multipleChoice),
      };
      
      await PollService.vote(request);
      
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
