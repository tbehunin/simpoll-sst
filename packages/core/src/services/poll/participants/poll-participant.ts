import { PollType, PollScope } from '@simpoll-sst/core/common';
import { PollParticipant } from './poll-participant.domain';
import { PollParticipantEntity } from '@simpoll-sst/core/common';
import { PollDetailEntity } from '@simpoll-sst/core/data';
import { SavePollData } from '../commands/save-poll/save-poll.types';
import { VoteRequest } from '../commands/vote/vote.types';
import { generateExpireTimestamp } from '../../utils';

/** Entity → Domain */
export const PollParticipantMapper = {
  fromEntity: (entity: PollParticipantEntity<PollType>): PollParticipant<PollType> => {
    const { pk, sk, type, gsipk1, gsisk1, voteTimestamp, vote } = entity;
    return {
      pollId: pk.split('#')[1],
      userId: sk.split('#')[1],
      type,
      scope: gsipk1.split('#')[3] === 'Public' ? PollScope.Public : PollScope.Private,
      voted: gsisk1.split('#')[1] === 'Y',
      expireTimestamp: gsisk1.split('#')[2],
      voteTimestamp,
      vote,
    };
  },

  fromEntityList: (entities: PollParticipantEntity<PollType>[]): PollParticipant<PollType>[] => {
    return entities.map(PollParticipantMapper.fromEntity);
  },
};

/** SavePollData / VoteRequest → Entity */
export const PollParticipantEntityBuilder = {
  fromSaveData: (
    pollId: string,
    request: SavePollData<PollType>
  ): PollParticipantEntity<PollType>[] => {
    if (request.sharedWith.length === 0) return [];

    const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
    return request.sharedWith.map((userId) => ({
      pk: `Poll#${pollId}`,
      sk: `Participant#${userId}`,
      type: request.type,
      gsipk1: `User#${userId}#Participant#Private`,
      gsipk2: `User#${userId}#Participant`,
      gsisk1: `Voted#N#${expireTimestamp}`,
      gsisk2: expireTimestamp,
    }));
  },

  fromVoteRequest: (
    poll: PollDetailEntity<PollType>,
    voteRequest: VoteRequest<PollType>
  ): PollParticipantEntity<PollType> => {
    const expireTimestamp = generateExpireTimestamp(poll.expireTimestamp);
    return {
      pk: poll.pk,
      sk: `Participant#${voteRequest.userId}`,
      type: poll.type,
      gsipk1: `User#${voteRequest.userId}#Participant#${poll.scope}`,
      gsipk2: `User#${voteRequest.userId}#Participant`,
      gsisk1: `Voted#Y#${expireTimestamp}`,
      gsisk2: expireTimestamp,
      voteTimestamp: new Date().toISOString(),
      vote: voteRequest.vote,
    };
  },
};
