import { PollScope, PollType, VotePrivacy } from '../common/types';

export interface PollDetailDocBase {
  pk: string
  sk: string
  gsipk1: string
  gsipk2: string
  gsisk2: string
  userId: string
  ct: string
  scope: PollScope
  type: PollType
  title: string
  expireTimestamp: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
};

export type PollDetailDoc<T> = PollDetailDocBase & {
  details: T
};

export type UserDoc = {
  pk: string
  sk: string
  username: string
  fullName: string
  email: string
  bio: string
};

export interface PollResultDocBase {
  pk: string
  sk: string
  type: PollType
  totalVotes: number
};
export type PollResultDoc<T> = PollResultDocBase & {
  results: T;
};

// export type ChoiceResultDoc = {
//   votes: number
//   users: string[]
// };

// export type MultipleChoiceResultDoc = PollResultDocBase & {
//   choices: ChoiceResultDoc[]
// };

// export type PollResultDoc = MultipleChoiceResultDoc; // | RankResultDoc | etc;

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

// export type MultipleChoiceVoterDoc = PollVoterDocBase & {
//   selectedIndex?: number[]
// };

export type PollVoterDoc<T> = PollVoterDocBase & {
  vote?: T
};
