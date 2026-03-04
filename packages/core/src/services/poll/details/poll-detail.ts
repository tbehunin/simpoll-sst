import { PollType, VotePrivacy, PollDetailMap } from '@simpoll-sst/core/common';
import { PollDetail } from './poll-detail.domain';
import { PollDetailEntity } from '@simpoll-sst/core/data';
import { DraftPollPayload, PublishPollPayload } from '../commands/save-poll/save-poll.types';
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

/** DraftPollPayload / PublishPollPayload → Entity */
export const PollDetailEntityBuilder = {
  fromDraftPayload: (
    pollId: string,
    createdTimestamp: string,
    payload: DraftPollPayload<PollType>
  ): PollDetailEntity<PollType> => {
    const scope = calculatePollScope(payload.sharedWith ?? [], false);
    const expireTimestamp = generateExpireTimestamp(payload.expireTimestamp);
    return {
      pk: `Poll#${pollId}`,
      sk: 'Details',
      gsipk1: `User#${payload.userId}#Author#${scope}`,
      gsipk2: `User#${payload.userId}#Author`,
      gsisk2: expireTimestamp,
      userId: payload.userId,
      ct: createdTimestamp,
      scope,
      type: payload.type,
      title: payload.title as string,
      expireTimestamp,
      sharedWith: payload.sharedWith as string[],
      votePrivacy: payload.votePrivacy as VotePrivacy,
      details: payload.details as PollDetailMap[PollType],
    };
  },

  fromPublishPayload: (
    pollId: string,
    createdTimestamp: string,
    payload: PublishPollPayload<PollType>
  ): PollDetailEntity<PollType> => {
    const scope = calculatePollScope(payload.sharedWith, true);
    const expireTimestamp = generateExpireTimestamp(payload.expireTimestamp);
    return {
      pk: `Poll#${pollId}`,
      sk: 'Details',
      gsipk1: `User#${payload.userId}#Author#${scope}`,
      gsipk2: `User#${payload.userId}#Author`,
      gsisk2: expireTimestamp,
      userId: payload.userId,
      ct: createdTimestamp,
      scope,
      type: payload.type,
      title: payload.title,
      expireTimestamp,
      sharedWith: payload.sharedWith,
      votePrivacy: payload.votePrivacy,
      details: payload.details,
    };
  },
};