import { Util } from "@simpoll-sst/core/util";
import polls from "./polls.json";
import pollVotes from "./pollVotes.json";
import results from "./results.json";
import comments from "./comments.json";
import users from "./users.json";
import { dbClient } from "../../../core/src/data/dbClient";


export const main = Util.handler(async (event) => {
  const items = polls
    // @ts-ignore
    .concat(pollVotes)
    // @ts-ignore
    .concat(results)
    // @ts-ignore
    .concat(comments)
    // @ts-ignore
    .concat(users);

  await dbClient.batchWrite(items);

  return JSON.stringify(items);
});
