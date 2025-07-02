import { PollDetailMap, PollScope, PollType, VotePrivacy } from '../../common/types';

export interface PollDetailEntityBase {
  pk: string;
  sk: string;
  gsipk1: string;
  gsipk2: string;
  gsisk2: string;
  userId: string;
  ct: string;
  scope: PollScope;
  title: string;
  expireTimestamp: string;
  sharedWith: string[];
  votePrivacy: VotePrivacy;
};

export type PollDetailEntity<T extends PollType> = PollDetailEntityBase & {
  type: T
  details: PollDetailMap[T]
};
