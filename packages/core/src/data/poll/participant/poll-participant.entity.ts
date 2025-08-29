import { PollType, PollParticipantMap as PollParticipantMap } from "../../../common/types"

export interface PollParticipantEntityBase {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};

export type PollParticipantEntity<T extends PollType> = PollParticipantEntityBase & {
  type: T
  vote?: PollParticipantMap[T]
};
