import { PollType, VotePrivacy, PollDetailMap } from '@simpoll-sst/core/common';

export type SaveDraftRequest<T extends PollType> = {
  pollId?: string  // Optional: if provided, update existing draft; otherwise create new
  userId: string
  type: T
  title?: string  // Optional for drafts
  expireTimestamp?: string
  sharedWith?: string[]
  votePrivacy?: VotePrivacy
  details?: PollDetailMap[T]  // Optional: partial drafts allowed
};
