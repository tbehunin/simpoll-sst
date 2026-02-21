import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { generatePollUserId } from '@simpoll-sst/core/services/utils';
import { builder } from '../builder';
import { getRegisteredGraphQLPollTypes } from '../poll-types/registry';

export const pollParticipant = builder.loadableUnion('PollParticipant', {
  types: getRegisteredGraphQLPollTypes().map((h) => h.participantRef) as [any, ...any[]],
  resolveType: (obj: any) => `${obj.type}Participant`,
  load: async (pollParticipantIds: string[]) => {
    const pollParticipants = await PollService.getPollParticipantsByIds(pollParticipantIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollParticipantIds.map((pollParticipantId) => {
      const pollParticipant = pollParticipants.find(poll => generatePollUserId(poll.pollId, poll.userId) === pollParticipantId);
      return pollParticipant ? pollParticipant : null;
    });
  },
});
