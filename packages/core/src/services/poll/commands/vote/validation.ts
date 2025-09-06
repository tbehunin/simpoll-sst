import { PollType, PollScope } from '../../../../common/types';
import { VoteRequest } from './types';
import { VoteValidationContext } from './context';

type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// All validators are pure functions - no DB calls!
export const validatePollExists = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
  return context.poll 
    ? { isValid: true }
    : { isValid: false, errors: [`Poll with id ${request.pollId} not found`] };
};

export const validateNotAuthor = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
  return context.poll?.userId !== request.userId
    ? { isValid: true }
    : { isValid: false, errors: ['User cannot vote on their own poll'] };
};

export const validateNotExpired = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
  return context.poll && context.poll.expireTimestamp >= context.currentTime
    ? { isValid: true }
    : { isValid: false, errors: ['Poll has expired'] };
};

export const validateHasAccess = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
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
): ValidationResult => {
  return !context.existingParticipant?.voteTimestamp
    ? { isValid: true }
    : { isValid: false, errors: ['User has already voted on this poll'] };
};

// Compose all validators for vote requests
export const validateVoteRequest = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
  const validators = [
    validatePollExists,
    validateNotAuthor,
    validateNotExpired,
    validateHasAccess,
    validateNotAlreadyVoted,
  ];

  const errors = validators
    .map(validator => validator(request, context))
    .filter(result => !result.isValid)
    .flatMap(result => result.isValid ? [] : result.errors);

  return errors.length === 0 
    ? { isValid: true }
    : { isValid: false, errors };
};