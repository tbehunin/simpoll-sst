import { PollResultMap, PollType } from '../../../common/poll.types';

export interface PollResultBase {
  pollId: string
  totalVotes: number
};

export type PollResult<T extends PollType> = PollResultBase & {
  type: T
  results: PollResultMap[T]
};