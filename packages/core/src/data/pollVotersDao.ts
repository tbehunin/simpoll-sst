import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';
import { dbClient, DbId } from './dbClient';
import { PollVoteEntity, PollVoteEntityBase } from './types';

const mapToPollVoterDocBase = (rawData: Record<string, any>): PollVoteEntityBase => {
  const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
  return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
};

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollVoteEntity<PollType>[] => {
  if (!rawData) return [];
  return rawData.map((poll) => {
    const handler = getPollTypeHandler(poll.type);
    return {
      ...mapToPollVoterDocBase(poll),
      vote: poll.vote ? handler.parseVoter(poll.vote) : undefined,
    };
  });
};

export const pollVotersDao = {
  get: async (pollVoterId: string): Promise<PollVoteEntity<PollType>> => {
    const idSplit = pollVoterId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` }, 'PollVoters');
    const [result] = mapToDoc(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollVoterIds: string[]): Promise<PollVoteEntity<PollType>[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return mapToDoc(rawData);
  },
};
