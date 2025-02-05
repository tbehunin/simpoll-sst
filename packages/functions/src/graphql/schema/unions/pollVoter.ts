import { pollService } from "../../../../../core/src/services/pollService";
import { builder } from "../builder";
import { multipleChoiceVoter } from "../types/multipleChoicePoll";
import { rankVoter } from "../types/rankPoll";

export const pollVoter = builder.loadableUnion('PollVoter', {
  types: [multipleChoiceVoter, rankVoter],
  resolveType: (obj) => `${obj.type}Voter`,
  load: async (pollVoterIds: string[]) => {
    const pollVoters = await pollService.getPollVotersByIds(pollVoterIds);
    
    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollVoterIds.map((pollVoterId) => {
      const pollVoter = pollVoters.find(poll => generatePollVoterId(poll.pollId, poll.userId) === pollVoterId);
      return pollVoter ? pollVoter : null;
    });
  },
});

export const generatePollVoterId = (pollId: string, userId: string) => `${pollId}:${userId}`;
