import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';
import { dbClient, DbId } from './dbClient';
import { PollDetailEntity } from './types';
import { PollDetailEntityBase } from './PollDetailEntityBase';

const mapToPollDetailDocBase = (rawData: Record<string, any>): PollDetailEntityBase => {
  const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy } = rawData;
  return { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, title, expireTimestamp, sharedWith, votePrivacy};
};

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollDetailEntity<PollType>[] => {
  if (!rawData) return [];
  return rawData.map((poll) => {
    const handler = getPollTypeHandler(poll.type);
    return {
      ...mapToPollDetailDocBase(poll),
      type: poll.type,
      details: handler.parseDetails(poll.details),
    };
  });
};

export const pollDetailsDao = {
  get: async (pollId: string): Promise<PollDetailEntity<PollType>> => {
    const rawData = await dbClient.get({ pk: `Poll#${pollId}`, sk: 'Details' }, 'Details');
    const [result] = mapToDoc(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollIds: string[]): Promise<PollDetailEntity<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Details' }));
    const rawData = await dbClient.batchGet(keys, 'PollDetails');
    return mapToDoc(rawData);
  },
};
