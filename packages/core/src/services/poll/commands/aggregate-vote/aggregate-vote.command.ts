import { createContextCommand } from '../command-builder';
import { createAggregateVoteContext, AggregateVoteValidationContext } from './aggregate-vote.context';
import { validateAggregateVote } from './aggregate-vote.validation';
import { AggregateVoteRequest } from './aggregate-vote.types';
import { getPollTypeHandler } from '../../../../handlers/poll.registry';
import { dbClient } from '../../../../data/db.client';
import { ValidationError } from '../../../../errors';

const executeAggregateVote = async (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): Promise<void> => {
  const { participant } = request;
  const { pollId, userId, type, scope, vote } = participant;

  // Validate vote data exists
  if (!vote) {
    throw new ValidationError('Vote data is required for aggregation');
  }

  // Get the correct handler for atomic operations
  const handler = getPollTypeHandler(type);

  // Build atomic update request using the handler
  const updateRequest = handler.buildAggregateVoteUpdateRequest(pollId, userId, scope, vote);

  // Execute atomic update - no race conditions
  await dbClient.update(updateRequest);
};

// Composed command using context pattern for consistency
export const aggregateVoteCommand = createContextCommand(
  createAggregateVoteContext,
  validateAggregateVote,
  executeAggregateVote
);
