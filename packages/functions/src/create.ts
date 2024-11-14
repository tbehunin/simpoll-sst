import * as uuid from "uuid";
import { Resource } from "sst";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function main(event: APIGatewayProxyEvent) {
  let data, params;

  // Request body is passed in as a JSON encoded string in 'event.body'
  if (event.body) {
    data = JSON.parse(event.body);
    params = {
      TableName: Resource.Notes.name,
      Item: {
        // The attributes of the item to be created
        userId: "123", // The id of the author
        noteId: uuid.v1(), // A unique uuid
        content: data.content, // Parsed from request body
        attachment: data.attachment, // Parsed from request body
        createdAt: Date.now(), // Current Unix timestamp
      },
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: true }),
    };
  }

  try {
    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
}
