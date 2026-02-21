import { createContextCommand } from '../command-builder';
import { createVoteContext, VoteValidationContext } from './vote.context';
import { validateVoteRequest } from './vote.validation';
import { VoteRequest } from './vote.types';
import { PollType } from '@simpoll-sst/core/common';
import { PollParticipantMapper } from '../../participants';
import { dbClient } from '@simpoll-sst/core/data';

// Executor can reuse the poll from context - no additional DB call!
const executeVote = async (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): Promise<void> => {
  // We already have the poll from validation context
  const pollParticipantDoc = PollParticipantMapper.fromVoteRequest(context.poll!, request);
  await dbClient.put(pollParticipantDoc);
};

// Composed command with single DB fetch
export const voteCommand = createContextCommand(
  createVoteContext,
  validateVoteRequest,
  executeVote
);