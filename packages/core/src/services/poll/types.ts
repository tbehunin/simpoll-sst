import { PollScope, PollStatus, RoleType } from '../../common/types';

export type QueryPollsRequest = {
  userId: string,
  roleType: RoleType,
  scope?: PollScope,
  voted?: boolean,
  pollStatus?: PollStatus,
};
