import { pollTypeMapper } from '../mappers/pollTypeMapper';
import { dbClient, DbId } from './dbClient';
import { PollVoterDoc } from './types';

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollVoterDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ type }) => pollTypeMapper.get(type).mapToPollVoterDoc(rawData));
};

export const pollVotersDao = {
  get: async (pollVoterId: string): Promise<PollVoterDoc> => {
    const idSplit = pollVoterId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` }, 'PollVoters');
    const [result] = mapToDoc(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollVoterIds: string[]): Promise<PollVoterDoc[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return mapToDoc(rawData);
  },
};
