import { PollType } from "../../../common/types";
import { PollResult } from "./poll-result.domain";
import { PollResultEntity } from "../../../data/poll/result/poll-result.entity";
import { CreatePollRequest } from "../types";
import { getPollTypeHandler } from "../../../handlers/pollRegistry";
import { Mapper } from "../mappers/mapper.interface";

export const PollResultMapper: Mapper<PollResultEntity<PollType>, PollResult<PollType>> = {
  // Entity → Domain Model
  toDomain: (entity: PollResultEntity<PollType>): PollResult<PollType> => {
    const { pk, type, totalVotes, results } = entity;
    return {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      results,
    };
  },

  // Request + Context → Entity (Builder)
  fromCreateRequest: (
    pollId: string, 
    request: CreatePollRequest<PollType>
  ): PollResultEntity<PollType> => {
    const handler = getPollTypeHandler(request.type);
    return {
      pk: `Poll#${pollId}`,
      sk: 'Results',
      type: request.type,
      totalVotes: 0,
      results: handler.buildResults(request),
    };
  },

  // Batch transformations
  toDomainList: (entities: PollResultEntity<PollType>[]): PollResult<PollType>[] => {
    return entities.map(PollResultMapper.toDomain);
  },
};