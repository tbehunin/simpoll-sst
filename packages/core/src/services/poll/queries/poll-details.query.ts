import { createBatchQuery } from './query-builder';
import { PollDetailRepository } from '../../../data/poll/detail/poll-detail.repository';
import { QueryRepository } from '../../../data/poll/query/poll-query.repository';
import { PollDetailMapper } from '../mappers';
import { QueryPollsRequest } from '../../types';

export const getPollDetailsByIds = createBatchQuery(
  PollDetailRepository,
  PollDetailMapper
);

export const queryPollDetails = async (request: QueryPollsRequest): Promise<string[]> => {
  return QueryRepository.query(request);
};