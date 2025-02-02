import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

export type QueryParams = {
  IndexName: string
  ExpressionAttributeValues: any
  KeyConditionExpression: string
  ScanIndexForward?: boolean
};
export type DbId = {
  pk: string
  sk: string
};

const TableName = Resource.PollsTable.name;
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const dbClient = {
  batchWrite: async (items: any[]) => {
    const params = {
      RequestItems: {
        [TableName]: items.map((Item) => ({
          PutRequest: { Item },
        })),
      },
    };
    console.log('*** DATA ACCESS: BatchWriteCommand ***', params);
    await dynamoDb.send(new BatchWriteCommand(params));
  },
  query: async (params: QueryParams) => {
    const pollParams = {
      ...params,
      TableName,
    };
    console.log('*** DATA ACCESS: QueryCommand ***', pollParams);
    const result = await dynamoDb.send(new QueryCommand(pollParams));
    //console.log('query result', result);
    return (result || {}).Items;
  },
  batchGet: async (keys: DbId[]) => {
    const params = {
      RequestItems: {
        [TableName]: {
          Keys: keys,
        },
      },
    };
    console.log('*** DATA ACCESS: BatchGetCommand ***', params);
    const result = await dynamoDb.send(new BatchGetCommand(params));
    return result?.Responses?.[TableName] || [];
  },
};
