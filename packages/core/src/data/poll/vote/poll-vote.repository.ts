import { PollType } from "../../../common/types";
import { dbClient, DbId } from "../../dbClient";
import { Repository } from "../../repository.interface";
import { PollVoteEntity } from "./poll-vote.entity";
import { PollVoteMapper } from "./poll-vote.mapper";

export const PollVoteRepository: Repository<PollVoteEntity<PollType>> = {
  get: async (pollVoterId: string): Promise<PollVoteEntity<PollType>> => {
    const idSplit = pollVoterId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` }, 'PollVoters');
    const [result] = PollVoteMapper.toPollVoteEntity(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollVoterIds: string[]): Promise<PollVoteEntity<PollType>[]> => {
    const keys: DbId[] = pollVoterIds.map((pollVoterId) => {
      const idSplit = pollVoterId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Voter#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollVoters');
    return PollVoteMapper.toPollVoteEntity(rawData);
  },
};
