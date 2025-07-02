import { PollDetailMap, PollResultMap, PollScope, PollType, PollVoteMap, VotePrivacy } from './common/types';

export type User = {
  userId: string
  username: string
  fullName: string
  email: string
  bio: string
};

export interface PollBase {
  pollId: string
  userId: string
  ct: string
  scope: PollScope
  title: string
  expireTimestamp: string
  votePrivacy: VotePrivacy
  sharedWith: string[]
};

export type Poll<T extends PollType> = PollBase & {
  type: T
  details: PollDetailMap[T]
};

export interface PollResultBase {
  pollId: string
  totalVotes: number
};

export type PollResult<T extends PollType> = PollResultBase & {
  type: T
  results: PollResultMap[T]
};

export interface PollVoterBase {
  pollId: string
  userId: string
  scope: PollScope
  voted: boolean
  expireTimestamp: string
  voteTimestamp?: string
};

export type PollVoter<T extends PollType> = PollVoterBase & {
  type: T
  vote?: PollVoteMap[T]
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

export type MultipleChoiceVote = {
  selectedIndex: number[]
};

export type PollVote = MultipleChoiceVote;
