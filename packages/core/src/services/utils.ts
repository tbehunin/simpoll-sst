import { MAX_DATE } from '@simpoll-sst/core/common';
import { PollScope } from '@simpoll-sst/core/common';

/**
 * Calculate poll scope based on publish status and shared users
 * @param sharedWith - Array of user IDs to share with
 * @param isPublished - Whether poll is published (not a draft)
 * @returns Draft if not published, otherwise Private if sharedWith has users, else Public
 */
export const calculatePollScope = (sharedWith: string[], isPublished: boolean): PollScope => {
  if (!isPublished) return PollScope.Draft;
  return sharedWith.length > 0 ? PollScope.Private : PollScope.Public;
};

export const generateExpireTimestamp = (expireTimestamp: string | undefined): string =>
  expireTimestamp || MAX_DATE;

export const generatePollUserId = (pollId: string, userId: string) => `${pollId}:${userId}`;
