import { AggregateVoteRequest } from './aggregate-vote.types';
import { AggregateVoteValidationContext } from './aggregate-vote.context';
import { ValidationService } from '../../../../common/validation.service';
import { ValidationResult } from '../../../../common/validation.types';

// Legacy validation result type for backward compatibility
type LegacyValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Enhanced validation using Zod and poll-type-specific validation
export const validateAggregateVoteEnhanced = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): ValidationResult => {
  return ValidationService.validateAggregateVote(request, context);
};

// Legacy validation for backward compatibility
export const validateAggregateVote = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): LegacyValidationResult => {
  const enhancedResult = validateAggregateVoteEnhanced(request, context);
  
  if (enhancedResult.success) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    errors: enhancedResult.errors.map(err => `${err.field}: ${err.message}`)
  };
};

// Legacy validation logic (kept for reference)
export const validateAggregateVoteLegacy = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): LegacyValidationResult => {
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
