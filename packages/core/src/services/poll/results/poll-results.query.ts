import { createBatchQuery } from '../queries/query-builder';
import { pollResultRepository } from '../../../data/poll/result/poll-result.repository';
import { PollResultMapper } from './poll-result.mapper';

export const getPollResultsByIds = createBatchQuery(
  pollResultRepository,
  PollResultMapper
);