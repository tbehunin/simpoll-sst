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
 * Validated, normalized payload passed to mappers after save-poll validation.
 * All fields are guaranteed to be present (publish path) — no optionals except expireTimestamp.
 */
export type SavePollData<T extends PollType> = {
  userId: string
  type: T
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: PollDetailMap[T]
};
