import { createBatchQuery } from '../queries/query-builder';
import { PollDetailRepository } from '../../../data/poll/detail/poll-detail.repository';
import { QueryRepository } from '../../../data/poll/query/poll-query.repository';
import { PollDetailMapper } from './poll-detail.mapper';
import { QueryPollsRequest } from '../poll.types';
import { PaginatedResult } from '../../../common/pagination.types';
import { encodeCursor, decodeCursor } from '../queries/cursor';

export const getPollDetailsByIds = createBatchQuery(
  PollDetailRepository,
  PollDetailMapper
);

export const queryPollDetails = async (request: QueryPollsRequest): Promise<PaginatedResult<string>> => {
  // Service layer handles cursor encoding/decoding
  const exclusiveStartKey = request.cursor ? decodeCursor(request.cursor) : undefined;
  
  const { pollIds, lastEvaluatedKey } = await QueryRepository.query({
    ...request,
    exclusiveStartKey,
  });

  return {
    items: pollIds,
    nextCursor: lastEvaluatedKey ? encodeCursor(lastEvaluatedKey) : null,
  };
};