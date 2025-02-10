import { pollTypeMapper } from '../mappers/pollTypeMapper';
import { dbClient, DbId } from './dbClient';
import { PollDetailDoc } from './types';

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollDetailDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ type }) => pollTypeMapper.get(type).mapToPollDetailDoc(rawData));
};

export const pollDetailsDao = {
  get: async (pollId: string): Promise<PollDetailDoc> => {
    const rawData = await dbClient.get({ pk: `Poll#${pollId}`, sk: 'Details' }, 'Details');
    const [result] = mapToDoc(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollIds: string[]): Promise<PollDetailDoc[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Details' }));
    const rawData = await dbClient.batchGet(keys, 'PollDetails');
    return mapToDoc(rawData);
  },
};
