import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';
import { dbClient, DbId } from './dbClient';
import { PollResultEntity, PollResultEntityBase } from './types';

const mapToPollResultDocBase = (rawData: Record<string, any>): PollResultEntityBase => {
  const { pk, sk, type, totalVotes } = rawData;
  return { pk, sk, type, totalVotes };
};

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollResultEntity<PollType>[] => {
  if (!rawData) return [];
  return rawData.map((poll) => {
    const handler = getPollTypeHandler(poll.type);
    return {
      ...mapToPollResultDocBase(rawData),
      results: handler.parseResults(poll.results),
    };
  });
};

export const pollResultsDao = {
  batchGet: async (pollIds: string[]): Promise<PollResultEntity<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');
    return mapToDoc(rawData);
  },
};
