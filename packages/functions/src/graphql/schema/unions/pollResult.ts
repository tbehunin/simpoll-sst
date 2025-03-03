import { pollService } from '@simpoll-sst/core/services/pollService';
import { builder } from '../builder';
import { multipleChoiceResult } from '../types/multipleChoicePoll';

export const pollResult = builder.loadableUnion('PollResult', {
  types: [multipleChoiceResult],
  resolveType: (obj) => `${obj.type}Result`,
  load: async (pollIds: string[]) => {
    const polls = await pollService.getPollResultsByIds(pollIds);
    
    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollIds.map((pollId) => {
      const poll = polls.find(poll => poll.pollId === pollId);
      return poll ? poll : null;
    });
  },
});
