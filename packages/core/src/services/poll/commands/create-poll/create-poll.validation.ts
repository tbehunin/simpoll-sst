import { CreatePollRequest } from './create-poll.types';
import { CreatePollValidationContext } from './create-poll.context';
import { PollType } from '../../../../common/poll.types';
import { ValidationService } from '../../../../common/validation.service';
import { ValidationResult } from '../../../../common/validation.types';

// Legacy validation result type for backward compatibility
type LegacyValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Enhanced validation using Zod and poll-type-specific validation
export const validateCreatePollEnhanced = <T extends PollType>(
  request: CreatePollRequest<T>,
  context: CreatePollValidationContext
): ValidationResult => {
  return ValidationService.validateCreatePoll(request, context);
};

// Legacy validation for backward compatibility
export const validateCreatePoll = (
  request: CreatePollRequest<PollType>,
  context: CreatePollValidationContext
): LegacyValidationResult => {
  const enhancedResult = validateCreatePollEnhanced(request, context);
  
  if (enhancedResult.success) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    errors: enhancedResult.errors.map(err => `${err.field}: ${err.message}`)
  };
};

// Utility function to convert legacy result to enhanced result
export const convertLegacyValidationResult = (
  legacyResult: LegacyValidationResult
): ValidationResult => {
  if (legacyResult.isValid) {
    return { success: true, data: null };
  }
  
  return {
    success: false,
    errors: legacyResult.errors.map(error => ({
      field: 'unknown',
      message: error,
      code: 'legacy_validation_error'
    }))
  };
};