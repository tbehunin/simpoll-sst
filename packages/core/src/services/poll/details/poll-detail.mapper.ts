import { PollType, PollScope } from '@simpoll-sst/core/common';
import { PollDetail } from './poll-detail.domain';
import { PollDetailEntity } from '@simpoll-sst/core/data';
import { CreatePollRequest } from '../poll-request.types';
import { generateExpireTimestamp, calculatePollScope } from '../../utils';
import { Mapper } from '../mappers/mapper.interface';

export const PollDetailMapper: Mapper<PollDetailEntity<PollType>, PollDetail<PollType>> = {
  // Entity → Domain Model
  toDomain: (entity: PollDetailEntity<PollType>): PollDetail<PollType> => {
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

  // Request + Context → Entity (Builder)
  fromCreateRequest: (
    pollId: string, 
    createdTimestamp: string, 
    request: CreatePollRequest<PollType>,
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

  // Batch transformations
  toDomainList: (entities: PollDetailEntity<PollType>[]): PollDetail<PollType>[] => {
    return entities.map(PollDetailMapper.toDomain);
  },
};