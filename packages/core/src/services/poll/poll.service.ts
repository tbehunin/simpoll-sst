import { getPollDetailsByIds, queryPollDetails, getPollResultsByIds, getPollParticipantsByIds } from './queries';
import { createPollCommand, saveDraftCommand, publishPollCommand, voteCommand, aggregateVoteCommand } from './commands';

export const PollService = {
  // Queries
  queryPollDetails,
  getPollDetailsByIds,
  getPollResultsByIds,
  getPollParticipantsByIds,

  // Commands
  createPoll: createPollCommand,
  saveDraft: saveDraftCommand,
  publishPoll: publishPollCommand,
  vote: voteCommand,
  aggregateVote: aggregateVoteCommand,
};
