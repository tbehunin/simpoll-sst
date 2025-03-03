import { MAX_DATE } from '../common/constants';
import { PollScope } from '../common/types';

export const generatePollScope = (sharedWith: string[]): PollScope =>
  sharedWith.length > 0 ? PollScope.Private : PollScope.Public;

export const generateExpireTimestamp = (expireTimestamp: string | undefined): string =>
  expireTimestamp || MAX_DATE;

export const generatePollVoterId = (pollId: string, userId: string) => `${pollId}:${userId}`;
