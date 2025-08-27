import { PollScope, PollType, PollVoteMap } from '../../../common/types';

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