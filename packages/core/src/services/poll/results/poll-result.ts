import { PollType } from '@simpoll-sst/core/common';
import { PollResult } from './poll-result.domain';
import { PollResultEntity } from '@simpoll-sst/core/data';
import { PublishPollPayload } from '../commands/save-poll/save-poll.types';
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

/** PublishPollPayload → Entity */
export const PollResultEntityBuilder = {
  fromPublishPayload: (pollId: string, payload: PublishPollPayload<PollType>): PollResultEntity<PollType> => {
    const handler = getPollTypeHandler(payload.type);
    return {
      pk: `Poll#${pollId}`,
      sk: 'Results',
      type: payload.type,
      totalVotes: 0,
      results: handler.buildResults(payload),
    };
  },
};