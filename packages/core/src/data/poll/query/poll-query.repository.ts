import { MAX_DATE, MIN_DATE } from '../../../common/constants';
import { RoleType, PollScope, PollStatus } from '../../../common/types';
import { QueryPollsRequest } from '../../../services/poll/types';
import { dbClient } from '../../dbClient';

type QueryParams = {
  IndexName: string
  ExpressionAttributeValues: Record<string, string>
  KeyConditionExpression: string
  ScanIndexForward?: boolean
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
  query: async ({ userId, roleType, scope, voted, pollStatus }: QueryPollsRequest): Promise<string[]> => {
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
    const rawData = await dbClient.query(params);
    return rawData?.map(({ pk }) => (pk.split('#')[1])) || [];
  },
};
