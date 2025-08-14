import { getPollsByIds, queryPolls, getPollResultsByIds, getPollVotersByIds } from './queries';
import { createPollCommand, voteCommand } from './commands';

export const PollService = {
  // Queries
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  
  // Commands
  createPoll: createPollCommand,
  vote: voteCommand,
};
