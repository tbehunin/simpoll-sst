import { pollTypeMapper } from '../mappers/pollTypeMapper';
import { dbClient, DbId } from './dbClient';
import { PollVoterDoc } from './types';

const mapToDoc = <Detail, Result, Voter>(rawData: Record<string, any>[] | undefined): PollVoterDoc<Voter>[] => {
  if (!rawData) return [];
  return rawData.map(({ type }) => pollTypeMapper.get<Detail, Result, Voter>(type).mapToPollVoterDoc(rawData));
};

export const pollVotersDao = {
  get: async <Detail, Result, Voter>(pollVoterId: string): Promise<PollVoterDoc<Voter>> => {
    const idSplit = pollVoterId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` }, 'PollVoters');
    const [result] = mapToDoc<Detail, Result, Voter>(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async <Voter>(pollVoterIds: string[]): Promise<PollVoterDoc<Voter>[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return mapToDoc(rawData);
  },
};
