import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';
import { dbClient, DbId } from './dbClient';
import { PollResultDoc, PollResultDocBase } from './types';

const mapToPollResultDocBase = (rawData: Record<string, any>): PollResultDocBase => {
  const { pk, sk, type, totalVotes } = rawData;
  return { pk, sk, type, totalVotes };
};

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollResultDoc<PollType>[] => {
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
  batchGet: async (pollIds: string[]): Promise<PollResultDoc<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');
    return mapToDoc(rawData);
  },
};
