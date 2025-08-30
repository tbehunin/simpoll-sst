import { PollResultMap, PollType } from "../../../common/types";

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
