import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';
import { dbClient, DbId } from './dbClient';
import { PollVoterDoc, PollVoterDocBase } from './types';

const mapToPollVoterDocBase = (rawData: Record<string, any>): PollVoterDocBase => {
  const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
  return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
};

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollVoterDoc<PollType>[] => {
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
  get: async (pollVoterId: string): Promise<PollVoterDoc<PollType>> => {
    const idSplit = pollVoterId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` }, 'PollVoters');
    const [result] = mapToDoc(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollVoterIds: string[]): Promise<PollVoterDoc<PollType>[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return mapToDoc(rawData);
  },
  parseStreamImage: (image: Record<string, any>): PollVoterDoc<PollType> => {
    const handler = getPollTypeHandler(image.type.S as PollType);
    return {
      pk: image.pk.S,
      sk: image.sk.S,
      type: image.type.S as PollType,
      gsipk1: image.gsipk1.S,
      gsipk2: image.gsipk2.S,
      gsisk1: image.gsisk1.S,
      gsisk2: image.gsisk2.S,
      voteTimestamp: image.voteTimestamp.S,
      vote: handler.parseVoteStream(image.vote),
    };
  }
};
