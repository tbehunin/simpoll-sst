import { createBatchQuery } from './query-builder';
import { PollVoteRepository } from '../../../data/poll/vote/poll-vote.repository';
import { PollVoterMapper } from '../mappers';

export const getPollVotersByIds = createBatchQuery(
  PollVoteRepository,
  PollVoterMapper
);