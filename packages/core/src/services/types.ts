import { PollDetailsMap, PollScope, PollStatus, PollType, PollVoterMap, RoleType, VotePrivacy } from '../common/types';

export type QueryPollsRequest = {
  userId: string,
  roleType: RoleType,
  scope?: PollScope,
  voted?: boolean,
  pollStatus?: PollStatus,
};

export type CreatePollRequest<T extends PollType> = {
  userId: string
  type: T
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: PollDetailsMap[T]
};

export type VoteRequest<T extends PollType> = {
  pollId: string
  userId: string
  type: T
  vote: PollVoterMap[T]
};
