import { PollType } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { PollParticipantEntity, PollParticipantEntityBase } from '@simpoll-sst/core/common';

export const PollParticipantMapper = {
  toPollParticipantEntity: (rawData: Record<string, any>[] | undefined): PollParticipantEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollParticipantMapper.toPollParticipantEntityBase(poll),
        vote: poll.vote ? handler.parseParticipant(poll.vote) : undefined,
      };
    });
  },
  toPollParticipantEntityBase: (rawData: Record<string, any>): PollParticipantEntityBase => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
    return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
  },
};
