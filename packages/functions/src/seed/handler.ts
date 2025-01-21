import { Util } from "@simpoll-sst/core/util";
import polls from "./polls.json";
import pollVotes from "./pollVotes.json";
import results from "./results.json";
import comments from "./comments.json";
import users from "./users.json";
import { dbClient } from "../../../core/src/data/dbClient";


export const main = Util.handler(async (event) => {
  const now = new Date().toISOString();
  const nowPlus1Min = new Date(Date.now() + 60000).toISOString();
  const items = polls.map((poll) => ({
      ...poll,
      ct: now,
    }))
    // @ts-ignore
    .concat(pollVotes.map((pollVote) => ({
      ...pollVote,
      gsisk2: nowPlus1Min,
      voteTimestamp: nowPlus1Min,
    })))
    // @ts-ignore
    .concat(comments)
    // @ts-ignore
    .concat(results)
    // @ts-ignore
    .concat(users);

  await dbClient.batchWrite(items);

  return JSON.stringify(items);
});
