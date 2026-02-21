import { createBatchQuery } from '../queries/query-builder';
import { PollDetailRepository, QueryRepository } from '@simpoll-sst/core/data';
import { PollDetailMapper } from './poll-detail.mapper';
import { QueryPollsRequest } from '../poll.types';
import { PaginatedResult } from '@simpoll-sst/core/common';
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