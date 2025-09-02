import { AggregateVoteRequest } from './types';
import { AggregateVoteValidationContext } from './context';

type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Validation for aggregate vote command
export const validateAggregateVote = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): ValidationResult => {
  const { pollParticipant, voteStreamData } = request;
  const errors: string[] = [];

  if (!pollParticipant?.pollId) {
    errors.push('Poll ID is required');
  }

  if (!pollParticipant?.userId) {
    errors.push('User ID is required');
  }

  if (!pollParticipant?.voted) {
    errors.push('Participant has not voted');
  }

  if (!voteStreamData) {
    errors.push('Vote stream data is required');
  }

  if (!context.pollResults) {
    errors.push('Poll results not found');
  }

  return errors.length === 0 
    ? { isValid: true }
    : { isValid: false, errors };
};