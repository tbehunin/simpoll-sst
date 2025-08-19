import { createBatchQuery } from './query-builder';
import { pollResultRepository } from '../../../data/poll/result/poll-result.repository';
import { PollResultMapper } from '../mappers';

export const getPollResultsByIds = createBatchQuery(
  pollResultRepository,
  PollResultMapper
);