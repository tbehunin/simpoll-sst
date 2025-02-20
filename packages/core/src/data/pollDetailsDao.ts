import { pollTypeMapper } from '../mappers/pollTypeMapper';
import { dbClient, DbId } from './dbClient';
import { PollDetailDoc } from './types';

const mapToDoc = <Detail, Result, Voter>(rawData: Record<string, any>[] | undefined): PollDetailDoc<Detail>[] => {
  if (!rawData) return [];
  return rawData.map(({ type }) => pollTypeMapper.get<Detail, Result, Voter>(type).mapToPollDetailDoc(rawData));
};

export const pollDetailsDao = {
  get: async <Detail, Result, Voter>(pollId: string): Promise<PollDetailDoc<Detail>> => {
    const rawData = await dbClient.get({ pk: `Poll#${pollId}`, sk: 'Details' }, 'Details');
    const [result] = mapToDoc<Detail, Result, Voter>(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async <Detail>(pollIds: string[]): Promise<PollDetailDoc<Detail>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Details' }));
    const rawData = await dbClient.batchGet(keys, 'PollDetails');
    return mapToDoc(rawData);
  },
};
