import { PollDetailMap, PollScope, PollType, VotePrivacy } from '../../../common/types';

export interface PollDetailBase {
  pollId: string
  userId: string
  ct: string
  scope: PollScope
  title: string
  expireTimestamp: string
  votePrivacy: VotePrivacy
  sharedWith: string[]
};

export type PollDetail<T extends PollType> = PollDetailBase & {
  type: T
  details: PollDetailMap[T]
};

export interface CreatePollDetailBase {
  userId: string
  title: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  expireTimestamp?: string
};

export type CreatePoll<T> = CreatePollDetailBase & {
  details: T
};