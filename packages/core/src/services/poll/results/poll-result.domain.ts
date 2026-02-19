import { PollResultMap, PollType } from '@simpoll-sst/core/common';

export interface PollResultBase {
  pollId: string
  totalVotes: number
};

export type PollResult<T extends PollType> = PollResultBase & {
  type: T
  results: PollResultMap[T]
};