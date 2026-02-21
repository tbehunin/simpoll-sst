import { PollScope, PollType, PollParticipantMap } from '@simpoll-sst/core/common';

export interface PollParticipantBase {
  pollId: string
  userId: string
  scope: PollScope
  voted: boolean
  expireTimestamp: string
  voteTimestamp?: string
};

export type PollParticipant<T extends PollType> = PollParticipantBase & {
  type: T
  vote?: PollParticipantMap[T]
};