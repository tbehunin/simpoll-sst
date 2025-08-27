import { getPollDetailsByIds, queryPollDetails, getPollResultsByIds, getPollVotersByIds } from './queries';
import { createPollCommand, voteCommand } from './commands';

export const PollService = {
  // Queries
  queryPollDetails,
  getPollDetailsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  
  // Commands
  createPoll: createPollCommand,
  vote: voteCommand,
};
