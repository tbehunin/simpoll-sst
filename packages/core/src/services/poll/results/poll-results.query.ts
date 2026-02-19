import { createBatchQuery } from '../queries/query-builder';
import { pollResultRepository } from '@simpoll-sst/core/data';
import { PollResultMapper } from './poll-result.mapper';

export const getPollResultsByIds = createBatchQuery(
  pollResultRepository,
  PollResultMapper
);