import { createContextCommand } from '../command-builder';
import { createAggregateVoteContext, AggregateVoteValidationContext } from './context';
import { validateAggregateVote } from './validation';
import { AggregateVoteRequest } from './types';
import { getPollTypeHandler } from '../../../../handlers/pollRegistry';
import { dbClient } from '../../../../data/dbClient';

const executeAggregateVote = async (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): Promise<void> => {
  const { participant } = request;
  const { pollId, userId, type, scope, vote } = participant;

  // Validate vote data exists
  if (!vote) {
    throw new Error('Vote data is required for aggregation');
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
