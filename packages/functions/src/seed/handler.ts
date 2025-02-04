import { Util } from "@simpoll-sst/core/util";
import pollDetails from "./pollDetails.json";
import pollVoters from "./pollVoters.json";
import results from "./pollResults.json";
import comments from "./comments.json";
import users from "./users.json";
import { dbClient } from "../../../core/src/data/dbClient";


export const main = Util.handler(async (event) => {
  const now = new Date().toISOString();
  const nowPlus1Min = new Date(Date.now() + 60000).toISOString();
  const nowPlus4Hours = new Date(Date.now() + 14400000).toISOString();
  const items = pollDetails.map((poll) => ({
      ...poll,
      ct: now,
      gsisk2: nowPlus4Hours,
      expireTimestamp: nowPlus4Hours,
    }))
    // @ts-ignore
    .concat(pollVoters.map((pollVote) => {
      const gsisk1Split = pollVote.gsisk1.split('#');
      gsisk1Split[2] = nowPlus4Hours;
      const voteTimestamp = pollVote.voteTimestamp ? nowPlus1Min : null;
      return {
        ...pollVote,
        gsisk1: gsisk1Split.join('#'),
        gsisk2: nowPlus4Hours,
        voteTimestamp,
      };
    }))
    // @ts-ignore
    .concat(comments)
    // @ts-ignore
    .concat(results)
    // @ts-ignore
    .concat(users);

  await dbClient.batchWrite(items);

  return JSON.stringify(items);
});
