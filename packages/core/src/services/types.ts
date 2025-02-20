import { PollScope, PollStatus, PollType, RoleType, VotePrivacy } from '../common/types';

export type QueryPollsRequest = {
  userId: string,
  roleType: RoleType,
  scope?: PollScope,
  voted?: boolean,
  pollStatus?: PollStatus,
};

export type CreatePollRequest<T> = {
  userId: string
  type: PollType
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: T
};

export type VoteRequest<T> = {
  pollId: string
  userId: string
  vote: T
};
