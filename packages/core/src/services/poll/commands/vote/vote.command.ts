import { createContextCommand } from '../command-builder';
import { createVoteContext, VoteValidationContext } from './vote.context';
import { validateVoteRequest } from './vote.validation';
import { VoteRequest } from './vote.types';
import { PollType } from '../../../../common/poll.types';
import { PollParticipantMapper } from '../../participants';
import { dbClient } from '../../../../data/db.client';

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