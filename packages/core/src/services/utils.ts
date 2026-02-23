import { MAX_DATE } from '@simpoll-sst/core/common';
import { PollScope } from '@simpoll-sst/core/common';

/**
 * Calculate poll scope based on draft status and shared users
 * @param sharedWith - Array of user IDs to share with
 * @param isDraft - Whether poll is a draft (not yet published)
 * @returns Draft if isDraft=true, otherwise Private if sharedWith has users, else Public
 */
export const calculatePollScope = (sharedWith: string[], isDraft: boolean = false): PollScope => {
  if (isDraft) return PollScope.Draft;
  return sharedWith.length > 0 ? PollScope.Private : PollScope.Public;
};

export const generateExpireTimestamp = (expireTimestamp: string | undefined): string =>
  expireTimestamp || MAX_DATE;

export const generatePollUserId = (pollId: string, userId: string) => `${pollId}:${userId}`;
