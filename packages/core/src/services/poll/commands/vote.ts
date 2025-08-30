import { createContextCommand } from './command-builder';
import { createValidationContext } from '../validation/validation-context';
import { validateVoteRequest } from '../validation/poll-validation';
import { VoteRequest } from '../types';
import { PollType } from '../../../common/types';
import { PollParticipantMapper } from '../participants';
import { dbClient } from '../../../data/dbClient';
import { ValidationContext } from '../validation/validation-context';

// Executor can reuse the poll from context - no additional DB call!
const executeVote = async (
  request: VoteRequest<PollType>, 
  context: ValidationContext
): Promise<void> => {
  // We already have the poll from validation context
  const pollParticipantDoc = PollParticipantMapper.fromVoteRequest(context.poll!, request);
  await dbClient.put(pollParticipantDoc);
};

// Composed command with single DB fetch
export const voteCommand = createContextCommand(
  createValidationContext,
  validateVoteRequest,
  executeVote
);