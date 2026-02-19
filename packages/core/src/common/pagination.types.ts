/**
 * Generic paginated result type for cursor-based pagination.
 * Used across data and service layers.
 */
export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
};
