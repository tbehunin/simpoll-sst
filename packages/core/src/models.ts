import { PollScope, PollType, VotePrivacy } from './common/types';

interface PollBase {
  pollId: string
  userId: string
  ct: string
  scope: PollScope
  type: PollType
  title: string
  expireTimestamp: string
  votePrivacy: VotePrivacy
  sharedWith: string[]
};

export type Poll<T> = PollBase & {
  details: T
};

export type User = {
  userId: string
  username: string
  fullName: string
  email: string
  bio: string
};

export interface PollResultBase {
  pollId: string
  type: PollType
  totalVotes: number
};

export type PollResult<T> = PollResultBase & {
  results: T
};

export interface PollVoterBase {
  pollId: string
  userId: string
  type: PollType
  pollScope: PollScope
  voted: boolean
  expireTimestamp: string
  voteTimestamp?: string
};

export type PollVoter<T> = PollVoterBase & {
  vote?: T
};

export interface CreatePollBase {
  userId: string
  title: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  expireTimestamp?: string
};

export type CreatePoll<T> = CreatePollBase & {
  details: T
};

// export type CreateMultipleChoicePoll = CreatePollBase & {
//   multiSelect: boolean
//   choices: string[]
// };

export type MultipleChoiceVote = {
  selectedIndex: number[]
};

export type PollVote = MultipleChoiceVote;
