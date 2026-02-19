/**
 * Encode a DynamoDB LastEvaluatedKey into an opaque cursor string.
 */
export const encodeCursor = (lastEvaluatedKey: Record<string, any>): string => {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64url');
};

/**
 * Decode an opaque cursor string back into a DynamoDB ExclusiveStartKey.
 */
export const decodeCursor = (cursor: string): Record<string, any> => {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
};
