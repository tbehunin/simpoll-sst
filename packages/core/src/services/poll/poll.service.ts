import { createPoll } from "./poll-creation.service";
import { queryPolls, getPollsByIds } from "./poll-query.service";
import { getPollResultsByIds } from "./poll-result.service";
import { getPollVotersByIds, vote } from "./poll-vote.service";

export const PollService = {
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  createPoll,
  vote,
};
