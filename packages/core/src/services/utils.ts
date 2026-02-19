import { MAX_DATE } from '@simpoll-sst/core/common';
import { PollScope } from '@simpoll-sst/core/common';

export const generatePollScope = (sharedWith: string[]): PollScope =>
  sharedWith.length > 0 ? PollScope.Private : PollScope.Public;

export const generateExpireTimestamp = (expireTimestamp: string | undefined): string =>
  expireTimestamp || MAX_DATE;

export const generatePollUserId = (pollId: string, userId: string) => `${pollId}:${userId}`;
