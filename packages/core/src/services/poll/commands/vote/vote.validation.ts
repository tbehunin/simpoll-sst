import { PollType, PollScope } from '../../../../common/poll.types';
import { VoteRequest } from './vote.types';
import { VoteValidationContext } from './vote.context';
import { ValidationService } from '../../../../common/validation.service';
import { ValidationResult } from '../../../../common/validation.types';

// Legacy validation result type for backward compatibility
type LegacyValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// All validators are pure functions - no DB calls!
export const validatePollExists = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  return context.poll
    ? { isValid: true }
    : { isValid: false, errors: [`Poll with id ${request.pollId} not found`] };
};

export const validateNotAuthor = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  return context.poll?.userId !== request.userId
    ? { isValid: true }
    : { isValid: false, errors: ['User cannot vote on their own poll'] };
};

export const validateNotExpired = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  return context.poll && context.poll.expireTimestamp >= context.currentTime
    ? { isValid: true }
    : { isValid: false, errors: ['Poll has expired'] };
};

export const validateHasAccess = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  if (!context.poll) return { isValid: false, errors: ['Poll not found'] };
  
  const hasAccess = context.poll.scope === PollScope.Public ||
                   context.poll.sharedWith.includes(request.userId);
  
  return hasAccess
    ? { isValid: true }
    : { isValid: false, errors: ['Poll has not been shared with the user'] };
};

export const validateNotAlreadyVoted = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  return !context.existingParticipant?.voteTimestamp
    ? { isValid: true }
    : { isValid: false, errors: ['User has already voted on this poll'] };
};

// Enhanced validation using Zod and poll-type-specific validation
export const validateVoteRequestEnhanced = <T extends PollType>(
  request: VoteRequest<T>,
  context: VoteValidationContext
): ValidationResult => {
  // First run the enhanced validation
  const enhancedResult = ValidationService.validateVote(request, context);
  
  if (!enhancedResult.success) {
    return enhancedResult;
  }
  
  // Then run the existing business logic validators
  const legacyValidators = [
    validatePollExists,
    validateNotAuthor,
    validateNotExpired,
    validateHasAccess,
    validateNotAlreadyVoted,
  ];

  const legacyErrors = legacyValidators
    .map(validator => validator(request, context))
    .filter(result => !result.isValid)
    .flatMap(result => result.isValid ? [] : result.errors);

  return legacyErrors.length === 0
    ? { success: true, data: null }
    : {
        success: false,
        errors: legacyErrors.map(error => ({
          field: 'vote',
          message: error,
          code: 'business_logic_error'
        }))
      };
};

// Legacy validation for backward compatibility
export const validateVoteRequest = (
  request: VoteRequest<PollType>,
  context: VoteValidationContext
): LegacyValidationResult => {
  const enhancedResult = validateVoteRequestEnhanced(request, context);
  
  if (enhancedResult.success) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    errors: enhancedResult.errors.map(err => `${err.field}: ${err.message}`)
  };
};