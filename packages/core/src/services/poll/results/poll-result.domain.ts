import { PollResultMap, PollType } from '../../../common/types';

export interface PollResultBase {
  pollId: string
  totalVotes: number
};

export type PollResult<T extends PollType> = PollResultBase & {
  type: T
  results: PollResultMap[T]
};