import { getPollDetailsByIds, queryPollDetails, getPollResultsByIds, getPollParticipantsByIds } from './queries';
import { createPollCommand, saveDraftCommand, voteCommand, aggregateVoteCommand } from './commands';

export const PollService = {
  // Queries
  queryPollDetails,
  getPollDetailsByIds,
  getPollResultsByIds,
  getPollParticipantsByIds,

  // Commands
  createPoll: createPollCommand,
  saveDraft: saveDraftCommand,
  vote: voteCommand,
  aggregateVote: aggregateVoteCommand,
};
