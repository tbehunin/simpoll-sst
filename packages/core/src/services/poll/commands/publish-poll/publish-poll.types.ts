import { PollType } from '@simpoll-sst/core/common';

export type PublishPollRequest = {
  pollId: string
  userId: string  // For authorization - must be poll author
};
