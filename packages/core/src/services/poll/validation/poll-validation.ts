import { PollType, PollScope } from "../../../common/types";
import { VoteRequest, CreatePollRequest } from "../../types";
import { ValidationContext } from "./validation-context";

type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };
type ContextValidator<T> = (request: T, context: ValidationContext) => ValidationResult;

// All validators are now pure functions - no DB calls!
export const validatePollExists: ContextValidator<VoteRequest<PollType>> = 
  (request, context) => {
    return context.poll 
      ? { isValid: true }
      : { isValid: false, errors: [`Poll with id ${request.pollId} not found`] };
  };

export const validateNotAuthor: ContextValidator<VoteRequest<PollType>> = 
  (request, context) => {
    return context.poll?.userId !== request.userId
      ? { isValid: true }
      : { isValid: false, errors: ['User cannot vote on their own poll'] };
  };

export const validateNotExpired: ContextValidator<VoteRequest<PollType>> = 
  (request, context) => {
    return context.poll && context.poll.expireTimestamp >= context.currentTime
      ? { isValid: true }
      : { isValid: false, errors: ['Poll has expired'] };
  };

export const validateHasAccess: ContextValidator<VoteRequest<PollType>> = 
  (request, context) => {
    if (!context.poll) return { isValid: false, errors: ['Poll not found'] };
    
    const hasAccess = context.poll.scope === PollScope.Public || 
                     context.poll.sharedWith.includes(request.userId);
    
    return hasAccess
      ? { isValid: true }
      : { isValid: false, errors: ['Poll has not been shared with the user'] };
  };

export const validateNotAlreadyVoted: ContextValidator<VoteRequest<PollType>> = 
  (request, context) => {
    return !context.existingVoter?.voteTimestamp
      ? { isValid: true }
      : { isValid: false, errors: ['User has already voted on this poll'] };
  };

// Compose all validators for vote requests
export const validateVoteRequest = (
  request: VoteRequest<PollType>, 
  context: ValidationContext
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

// Simple validation for create poll (no context needed)
export const validateCreatePoll = async (request: CreatePollRequest<PollType>): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  if (!request.title.trim()) errors.push('Title is required');
  if (!request.userId) errors.push('User ID is required');
  
  return errors.length === 0 
    ? { isValid: true }
    : { isValid: false, errors };
};