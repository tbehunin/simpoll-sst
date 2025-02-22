import { PollDetailsMap, PollResultsMap, PollScope, PollType, PollVoterMap, VotePrivacy } from '../common/types';

export type UserDoc = {
  pk: string
  sk: string
  username: string
  fullName: string
  email: string
  bio: string
};

export interface PollDetailDocBase {
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

export type PollDetailDoc<T extends PollType> = PollDetailDocBase & {
  type: T
  details: PollDetailsMap[T]
};

export interface PollResultDocBase {
  pk: string
  sk: string
  type: PollType
  totalVotes: number
};
export type PollResultDoc<T extends PollType> = PollResultDocBase & {
  type: T
  results: PollResultsMap[T];
};

export interface PollVoterDocBase {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};

export type PollVoterDoc<T extends PollType> = PollVoterDocBase & {
  type: T
  vote?: PollVoterMap[T]
};
