import { PollType, PollVoteMap } from "../../common/types"

export interface PollVoteEntityBase {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};

export type PollVoteEntity<T extends PollType> = PollVoteEntityBase & {
  type: T
  vote?: PollVoteMap[T]
};
