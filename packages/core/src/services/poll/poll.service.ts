import { getPollDetailsByIds, queryPollDetails, getPollResultsByIds, getPollParticipantsByIds } from './queries';
import { createPollCommand, voteCommand, aggregateVoteCommand } from './commands';

export const PollService = {
  // Queries
  queryPollDetails,
  getPollDetailsByIds,
  getPollResultsByIds,
  getPollParticipantsByIds,

  // Commands
  createPoll: createPollCommand,
  vote: voteCommand,
  aggregateVote: aggregateVoteCommand,
};
