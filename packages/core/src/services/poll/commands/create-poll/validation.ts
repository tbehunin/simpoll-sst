import { CreatePollRequest } from './types';
import { CreatePollValidationContext } from './context';
import { PollType } from '../../../../common/types';

type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Validation for create poll command
export const validateCreatePoll = (
  request: CreatePollRequest<PollType>, 
  context: CreatePollValidationContext
): ValidationResult => {
  const errors: string[] = [];
  
  if (!request.title.trim()) errors.push('Title is required');
  if (!request.userId) errors.push('User ID is required');
  if (!request.type) errors.push('Poll type is required');
  
  return errors.length === 0 
    ? { isValid: true }
    : { isValid: false, errors };
};