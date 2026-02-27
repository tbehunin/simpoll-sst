import { PollType, VotePrivacy, PollDetailMap } from '@simpoll-sst/core/common';

export type SavePollRequest<T extends PollType> = {
  pollId?: string
  userId: string
  type: T
  publish: boolean
  title?: string
  expireTimestamp?: string
  sharedWith?: string[]
  votePrivacy?: VotePrivacy
  details?: PollDetailMap[T]
};
