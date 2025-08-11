import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { generatePollVoterId } from '@simpoll-sst/core/services/utils';
import { builder } from '../builder';
import { multipleChoiceVoter } from '../types/multipleChoicePoll';

export const pollVoter = builder.loadableUnion('PollVoter', {
  types: [multipleChoiceVoter],
  resolveType: (obj) => `${obj.type}Voter`,
  load: async (pollVoterIds: string[]) => {
    const pollVoters = await PollService.getPollVotersByIds(pollVoterIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollVoterIds.map((pollVoterId) => {
      const pollVoter = pollVoters.find(poll => generatePollVoterId(poll.pollId, poll.userId) === pollVoterId);
      return pollVoter ? pollVoter : null;
    });
  },
});
