import { PollScope, PollStatus, PollType, RoleType, VotePrivacy } from '../common/types';
import { PollDetail } from '../models';

export type QueryPollsRequest = {
  userId: string,
  roleType: RoleType,
  scope?: PollScope,
  voted?: boolean,
  pollStatus?: PollStatus,
};

export type CreatePoll = {
  userId: string
  type: PollType
  title: string
  expireTimestamp?: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  details: PollDetail
};
