import { pollTypeMapper } from '../mappers/pollTypeMapper';
import { dbClient, DbId } from './dbClient';
import { PollResultDoc } from './types';

export const pollResultsDao = {
  batchGet: async (pollIds: string[]): Promise<PollResultDoc[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');

    if (!rawData) return [];

    return rawData.map(({ type }) => pollTypeMapper.get(type).mapToPollResultDoc(rawData));
  },
};
