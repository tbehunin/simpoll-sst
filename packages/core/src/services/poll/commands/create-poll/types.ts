import { PollType, VotePrivacy, PollDetailMap } from "../../../../common/types";

export type CreatePollRequest<T extends PollType> = {
  userId: string
  type: T
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: PollDetailMap[T]
};
