import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { getRegisteredGraphQLPollTypes } from '../poll-types/registry';

export const pollResult = builder.loadableUnion('PollResult', {
  types: getRegisteredGraphQLPollTypes().map((h) => h.resultRef) as [any, ...any[]],
  resolveType: (obj: any) => `${obj.type}Result`,
  load: async (pollIds: string[]) => {
    const polls = await PollService.getPollResultsByIds(pollIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollIds.map((pollId) => {
      const poll = polls.find(poll => poll.pollId === pollId);
      return poll ? poll : null;
    });
  },
});
