import { createBatchQuery } from '../queries/query-builder';
import { pollResultRepository } from '@simpoll-sst/core/data';
import { PollResultMapper } from './poll-result';

export const getPollResultsByIds = createBatchQuery(
  pollResultRepository,
  PollResultMapper
);