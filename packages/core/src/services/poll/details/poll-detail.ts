import { PollType } from '@simpoll-sst/core/common';
import { PollDetail } from './poll-detail.domain';
import { PollDetailEntity } from '@simpoll-sst/core/data';
import { SavePollData } from '../commands/save-poll/save-poll.types';
import { generateExpireTimestamp, calculatePollScope } from '../../utils';

/** Entity → Domain */
export const PollDetailMapper = {
  fromEntity: (entity: PollDetailEntity<PollType>): PollDetail<PollType> => {
    const { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details } = entity;
    return {
      pollId: pk.split('#')[1],
      userId,
      ct,
      scope,
      type,
      title,
      expireTimestamp,
      sharedWith,
      votePrivacy,
      details,
    };
  },

  fromEntityList: (entities: PollDetailEntity<PollType>[]): PollDetail<PollType>[] => {
    return entities.map(PollDetailMapper.fromEntity);
  },
};

/** SavePollData → Entity */
export const PollDetailEntityBuilder = {
  fromSaveData: (
    pollId: string,
    createdTimestamp: string,
    request: SavePollData<PollType>,
    isPublished: boolean
  ): PollDetailEntity<PollType> => {
    const scope = calculatePollScope(request.sharedWith, isPublished);
    const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);

    return {
      pk: `Poll#${pollId}`,
      sk: 'Details',
      gsipk1: `User#${request.userId}#Author#${scope}`,
      gsipk2: `User#${request.userId}#Author`,
      gsisk2: expireTimestamp,
      userId: request.userId,
      ct: createdTimestamp,
      scope,
      type: request.type,
      title: request.title,
      expireTimestamp,
      sharedWith: request.sharedWith,
      votePrivacy: request.votePrivacy,
      details: request.details,
    };
  },
};