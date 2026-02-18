import { PollType } from '../../../common/poll.types';
import { getPollTypeHandler } from '../../../poll-types/poll-type.registry';
import { PollDetailEntity, PollDetailEntityBase } from './poll-detail.entity';

export const PollDetailMapper = {
  toPollDetailEntity: (rawData: Record<string, any>[] | undefined): PollDetailEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollDetailMapper.toPollDetailEntityBase(poll),
        type: poll.type,
        details: handler.parseDetails(poll.details),
      };
    });
  },
  toPollDetailEntityBase: (rawData: Record<string, any>): PollDetailEntityBase => {
    const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy } = rawData;
    return { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy };
  },
};
