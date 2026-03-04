import { PollType } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { PollDetailEntity, PollDetailEntityBase } from './poll-detail.entity';

export const PollDetailEntityMapper = {
  fromRaw: (rawData: Record<string, any>[] | undefined): PollDetailEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollDetailEntityMapper.fromRawBase(poll),
        type: poll.type,
        details: handler.parseDetails(poll.details, poll.userId),
      };
    });
  },
  fromRawBase: (rawData: Record<string, any>): PollDetailEntityBase => {
    const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy } = rawData;
    return { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy };
  },
};
