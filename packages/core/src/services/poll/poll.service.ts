import { getPollDetailsByIds, queryPollDetails, getPollResultsByIds, getPollParticipantsByIds } from './queries';
import { savePollCommand, voteCommand, aggregateVoteCommand } from './commands';

export const PollService = {
  // Queries
  queryPollDetails,
  getPollDetailsByIds,
  getPollResultsByIds,
  getPollParticipantsByIds,

  // Commands
  savePoll: savePollCommand,
  vote: voteCommand,
  aggregateVote: aggregateVoteCommand,
};
