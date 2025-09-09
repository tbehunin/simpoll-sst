import { AggregateVoteRequest } from './aggregate-vote.types';
import { AggregateVoteValidationContext } from './aggregate-vote.context';

type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Validation for aggregate vote command
export const validateAggregateVote = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): ValidationResult => {
  const { participant } = request;
  const errors: string[] = [];

  if (!participant.pollId) {
    errors.push('Poll ID is required');
  }

  if (!participant.userId) {
    errors.push('User ID is required');
  }

  if (!participant.type) {
    errors.push('Poll type is required');
  }

  if (!participant.scope) {
    errors.push('Poll scope is required');
  }

  if (!participant.vote) {
    errors.push('Vote data is required');
  }

  if (!context.pollResults) {
    errors.push('Poll results not found');
  }

  return errors.length === 0
    ? { isValid: true }
    : { isValid: false, errors };
};
