import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const dbClient = {
  batchWrite: async (items: any[]) => {
    const params = {
      RequestItems: {
        [Resource.PollsTable.name]: items.map((Item) => ({
          PutRequest: { Item },
        })),
      },
    };
    await dynamoDb.send(new BatchWriteCommand(params));
  },
};
