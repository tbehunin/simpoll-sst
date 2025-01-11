import { Resource } from "sst";
import { Util } from "@simpoll-sst/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import polls from "./polls.json";
import pollVotes from "./pollVotes.json";
import results from "./results.json";
import comments from "./comments.json";
import users from "./users.json";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const pollsParams = polls.map((poll) => ({
    PutRequest: {
      Item: poll,
    },
  }));
  const pollVotesParams = pollVotes.map((pollVote) => ({
    PutRequest: {
      Item: pollVote,
    },
  }));
  const resultsParams = results.map((result) => ({
    PutRequest: {
      Item: result,
    },
  }));
  const commentsParams = comments.map((comment) => ({
    PutRequest: {
      Item: comment,
    },
  }));
  const usersParams = users.map((user) => ({
    PutRequest: {
      Item: user,
    },
  }));

  const params = {
    RequestItems: {
      [Resource.PollsTable.name]: pollsParams
        // @ts-ignore
        .concat(pollVotesParams)
        // @ts-ignore
        .concat(resultsParams)
        // @ts-ignore
        .concat(commentsParams)
        // @ts-ignore
        .concat(usersParams),
    },
  };

  await dynamoDb.send(new BatchWriteCommand(params));

  return JSON.stringify(params.RequestItems);
});
