import { PollResultMap, PollType } from '../../../common/poll.types';

export interface PollResultEntityBase {
  pk: string
  sk: string
  type: PollType
  totalVotes: number
};

export type PollResultEntity<T extends PollType> = PollResultEntityBase & {
  type: T
  results: PollResultMap[T];
};
