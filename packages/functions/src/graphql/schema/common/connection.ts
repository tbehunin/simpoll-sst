import { PaginatedResult } from '@simpoll-sst/core/common/pagination.types';

/**
 * Convert a PaginatedResult<string> (poll IDs from DynamoDB) into
 * the shape that Pothos Relay plugin's t.connection() resolve expects.
 *
 * Each pollId becomes an edge with:
 *   - cursor: the pollId itself (per-item cursor for Relay spec compliance)
 *   - node: the pollId (resolved by the Poll DataLoader)
 *
 * pageInfo uses the DynamoDB-level cursor (nextCursor) for hasNextPage/endCursor.
 */
export const toConnection = (result: PaginatedResult<string>) => ({
  pageInfo: {
    hasNextPage: result.nextCursor !== null,
    hasPreviousPage: false, // DynamoDB cursors are forward-only
    startCursor: result.items.length > 0 ? result.items[0] : null,
    endCursor: result.nextCursor,
  },
  edges: result.items.map((pollId) => ({
    cursor: pollId,
    node: pollId,
  })),
});
