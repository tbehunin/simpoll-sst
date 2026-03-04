import { PollType } from '@simpoll-sst/core/common';
import { PollResult } from './poll-result.domain';
import { PollResultEntity } from '@simpoll-sst/core/data';
import { SavePollPayload } from '../commands/save-poll/save-poll.types';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';

/** Entity → Domain */
export const PollResultMapper = {
  fromEntity: (entity: PollResultEntity<PollType>): PollResult<PollType> => {
    const { pk, type, totalVotes, results } = entity;
    return {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      results,
    };
  },

  fromEntityList: (entities: PollResultEntity<PollType>[]): PollResult<PollType>[] => {
    return entities.map(PollResultMapper.fromEntity);
  },
};

/** SavePollPayload → Entity */
export const PollResultEntityBuilder = {
  fromSavePollPayload: (pollId: string, request: SavePollPayload<PollType>): PollResultEntity<PollType> => {
    const handler = getPollTypeHandler(request.type);
    return {
      pk: `Poll#${pollId}`,
      sk: 'Results',
      type: request.type,
      totalVotes: 0,
      results: handler.buildResults(request),
    };
  },
};