import { PollType, PollScope } from "../../../common/types";
import { PollVoter } from "../../../models";
import { PollVoteEntity } from "../../../data/poll/vote/poll-vote.entity";
import { PollDetailEntity } from "../../../data/poll/detail/poll-detail.entity";
import { CreatePollRequest, VoteRequest } from "../../types";
import { generateExpireTimestamp } from "../../utils";
import { Mapper } from "./mapper.interface";

export const PollVoterMapper: Mapper<PollVoteEntity<PollType>, PollVoter<PollType>> & {
  fromVoteRequest: (poll: PollDetailEntity<PollType>, voteRequest: VoteRequest<PollType>) => PollVoteEntity<PollType>;
} = {
  // Entity → Domain Model
  toDomain: (entity: PollVoteEntity<PollType>): PollVoter<PollType> => {
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

  // Request + Context → Entity (Builder for creation)
  fromCreateRequest: (
    pollId: string, 
    request: CreatePollRequest<PollType>
  ): PollVoteEntity<PollType>[] => {
    if (request.sharedWith.length === 0) return [];
    
    const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
    return request.sharedWith.map((userId) => ({
      pk: `Poll#${pollId}`,
      sk: `Voter#${userId}`,
      type: request.type,
      gsipk1: `User#${userId}#Voter#Private`,
      gsipk2: `User#${userId}#Voter`,
      gsisk1: `Voted:N#${expireTimestamp}`,
      gsisk2: expireTimestamp,
    }));
  },

  // Request + Context → Entity (Builder for voting)
  fromVoteRequest: (
    poll: PollDetailEntity<PollType>, 
    voteRequest: VoteRequest<PollType>
  ): PollVoteEntity<PollType> => {
    const expireTimestamp = generateExpireTimestamp(poll.expireTimestamp);
    return {
      pk: poll.pk,
      sk: `Voter#${voteRequest.userId}`,
      type: poll.type,
      gsipk1: `User#${voteRequest.userId}#Voter#${poll.scope}`,
      gsipk2: `Poll#${voteRequest.userId}#Voter`,
      gsisk1: `Voted#Y#${expireTimestamp}`,
      gsisk2: expireTimestamp,
      voteTimestamp: new Date().toISOString(),
      vote: voteRequest.vote,
    };
  },

  // Batch transformations
  toDomainList: (entities: PollVoteEntity<PollType>[]): PollVoter<PollType>[] => {
    return entities.map(PollVoterMapper.toDomain);
  },
};