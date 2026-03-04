import { PollType, VotePrivacy, PollDetailMap } from '@simpoll-sst/core/common';

/**
 * Incoming API request — all fields optional (supports both drafts and publishes).
 */
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

/**
 * Draft payload — all content fields optional; no validation required.
 */
export type DraftPollPayload<T extends PollType> = {
  userId: string
  type: T
  title?: string
  expireTimestamp?: string
  sharedWith?: string[]
  votePrivacy?: VotePrivacy
  details?: PollDetailMap[T]
};

/**
 * Publish payload — all required fields guaranteed present by validation.
 */
export type PublishPollPayload<T extends PollType> = {
  userId: string
  type: T
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: PollDetailMap[T]
};
