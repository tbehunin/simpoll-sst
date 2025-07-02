import { PollDetailMap, PollResultMap, PollScope, PollType, PollVoteMap, VotePrivacy } from '../common/types';

export type UserEntity = {
  pk: string
  sk: string
  username: string
  fullName: string
  email: string
  bio: string
};

export interface PollDetailEntityBase {
  pk: string
  sk: string
  gsipk1: string
  gsipk2: string
  gsisk2: string
  userId: string
  ct: string
  scope: PollScope
  title: string
  expireTimestamp: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
};

export type PollDetailEntity<T extends PollType> = PollDetailEntityBase & {
  type: T
  details: PollDetailMap[T]
};

export interface PollResultEntityBase {
  pk: string
  sk: string
  type: PollType
  totalVotes: number
};
export type PollResultEntity<T extends PollType> = PollResultEntityBase & {
  type: T
  results: PollResultMap[T];
};

export interface PollVoteEntityBase {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};

export type PollVoteEntity<T extends PollType> = PollVoteEntityBase & {
  type: T
  vote?: PollVoteMap[T]
};
