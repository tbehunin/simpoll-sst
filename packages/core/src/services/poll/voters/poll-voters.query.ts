import { createBatchQuery } from '../queries/query-builder';
import { PollVoteRepository } from '../../../data/poll/vote/poll-vote.repository';
import { PollVoterMapper } from './poll-voter.mapper';

export const getPollVotersByIds = createBatchQuery(
  PollVoteRepository,
  PollVoterMapper
);