import { PollType } from '../common/types';
import { dbClient, DbId } from './dbClient';
import { PollVoterDoc, PollVoterDocBase } from './types';

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollVoterDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, ...rest }) => {
    const base: PollVoterDocBase = { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
    switch (type) {
      case PollType.MultipleChoice:
        const { selectedIndex } = rest;
        return { ...base, selectedIndex };
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

export const pollVotersDao = {
  batchGet: async (pollVoterIds: string[]): Promise<PollVoterDoc[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return mapToDoc(rawData);
  },
};
