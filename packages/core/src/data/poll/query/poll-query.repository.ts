import { MAX_DATE, MIN_DATE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@simpoll-sst/core/common';
import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common';
import { dbClient, QueryParams } from '@simpoll-sst/core/data';

/**
 * Repository-level request type for querying polls.
 * Uses raw DynamoDB types (exclusiveStartKey) instead of opaque cursors.
 */
type QueryPollsRepositoryRequest = {
  userId: string;
  roleType: RoleType;
  scope?: PollScope;
  voted?: boolean;
  pollStatus?: PollStatus;
  limit?: number;
  exclusiveStartKey?: Record<string, any>;
};

/**
 * Repository-level result type.
 * Returns raw DynamoDB lastEvaluatedKey instead of encoded cursor.
 */
type QueryPollsRepositoryResult = {
  pollIds: string[];
  lastEvaluatedKey?: Record<string, any>;
};

const generateInitialQueryParams = (skToken: string, userId: string, roleType: RoleType, scope?: PollScope): QueryParams => {
  let pk;
  let scopeValue;
  if (scope) {
    pk = 'gsipk1';
    scopeValue = `#${scope}`;
  } else {
    pk = 'gsipk2';
    scopeValue = '';
  }
  return {
    IndexName: `Idx_${pk}_${skToken}`,
    ExpressionAttributeValues: {
      ':pk': `User#${userId}#${roleType}${scopeValue}`,
    },
    KeyConditionExpression: `${pk} = :pk`,
    ScanIndexForward: false, // Sort in descending order
  };
};

export const QueryRepository = {
  query: async ({ userId, roleType, scope, voted, pollStatus, limit, exclusiveStartKey }: QueryPollsRepositoryRequest): Promise<QueryPollsRepositoryResult> => {
    const skToken = '[SKTOKEN]';
    const now = new Date().toISOString();
    const params = generateInitialQueryParams(skToken, userId, roleType, scope);

    if (roleType === RoleType.Participant && voted !== undefined) {
      params.IndexName = params.IndexName.replace(skToken, 'gsisk1');
      const votedYesNo = voted ? 'Y' : 'N';
      if (pollStatus === PollStatus.Open) {
        // All open voted or unvoted polls
        params.ExpressionAttributeValues[':now'] = `Voted#${votedYesNo}#${now}`;
        params.ExpressionAttributeValues[':max'] = `Voted#${votedYesNo}#${MAX_DATE}`;
        params.KeyConditionExpression += ' and gsisk1 between :now and :max';
      } else if (pollStatus === PollStatus.Closed) {
        // All closed voted or unvoted polls
        params.ExpressionAttributeValues[':min'] = `Voted#${votedYesNo}#${MIN_DATE}`;
        params.ExpressionAttributeValues[':now'] = `Voted#${votedYesNo}#${now}`;
        params.KeyConditionExpression += ' and gsisk1 between :min and :now';
      } else {
        // All voted or unvoted polls
        params.ExpressionAttributeValues[':prefix'] = `Voted#${votedYesNo}#`;
        params.KeyConditionExpression += ' and begins_with(gsisk1, :prefix)';
      }
    } else {
      // All public or private polls regardless of vote status
      params.IndexName = params.IndexName.replace(skToken, 'gsisk2');

      if (pollStatus === PollStatus.Open) {
        // All open voted or unvoted polls
        params.ExpressionAttributeValues[':now'] = `${now}`;
        params.ExpressionAttributeValues[':max'] = `${MAX_DATE}`;
        params.KeyConditionExpression += ' and gsisk2 between :now and :max';
      } else if (pollStatus === PollStatus.Closed) {
        // All closed voted or unvoted polls
        params.ExpressionAttributeValues[':min'] = `${MIN_DATE}`;
        params.ExpressionAttributeValues[':now'] = `${now}`;
        params.KeyConditionExpression += ' and gsisk2 between :min and :now';
      }
    }

    // Apply pagination
    const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    params.Limit = pageSize;
    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }

    const { items, lastEvaluatedKey } = await dbClient.query(params);
    const pollIds = items.map(({ pk }) => pk.split('#')[1]);

    return {
      pollIds,
      lastEvaluatedKey,
    };
  },
};
