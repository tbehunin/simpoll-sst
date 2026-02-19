import { z } from 'zod';
import { PollType, PollScope } from '@simpoll-sst/core/common';
import { VoteRequest } from './vote.types';
import { VoteValidationContext } from './vote.context';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { 
  ValidationResult, 
  zodToValidationResult,
  PollTypeSchema,
  UuidSchema,
} from '../validation.utils';

// Base schema for common vote request fields (vote data validated via registry)
const VoteRequestBaseSchema = z.object({
  pollId: UuidSchema,
  userId: UuidSchema,
  type: PollTypeSchema,
});

// --- Generic business logic validators (poll-type agnostic) ---

const validatePollExists = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): string | null => {
  return context.poll 
    ? null
    : `Poll with id ${request.pollId} not found`;
};

const validateNotAuthor = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): string | null => {
  return context.poll?.userId !== request.userId
    ? null
    : 'User cannot vote on their own poll';
};

const validateNotExpired = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): string | null => {
  if (!context.poll) return 'Poll not found';
  
  const pollExpireTime = new Date(context.poll.expireTimestamp).getTime();
  const currentTime = new Date(context.currentTime).getTime();
  
  return pollExpireTime >= currentTime
    ? null
    : 'Poll has expired';
};

const validateHasAccess = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): string | null => {
  if (!context.poll) return 'Poll not found';
  
  const hasAccess = context.poll.scope === PollScope.Public || 
                   context.poll.sharedWith.includes(request.userId);
  
  return hasAccess
    ? null
    : 'Poll has not been shared with the user';
};

const validateNotAlreadyVoted = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): string | null => {
  return !context.existingParticipant?.voteTimestamp
    ? null
    : 'User has already voted on this poll';
};

// Compose all validators for vote requests
export const validateVoteRequest = (
  request: VoteRequest<PollType>, 
  context: VoteValidationContext
): ValidationResult => {
  // 1. Validate common request fields
  const baseValidation = zodToValidationResult(VoteRequestBaseSchema, request);
  if (!baseValidation.isValid) return baseValidation;

  // 2. Validate vote data structure via registry
  const handler = getPollTypeHandler(request.type);
  const voteValidation = zodToValidationResult(handler.getVoteSchema(), request.vote);
  if (!voteValidation.isValid) return voteValidation;

  // 3. Generic business logic validators
  const genericErrors = [
    validatePollExists,
    validateNotAuthor,
    validateNotExpired,
    validateHasAccess,
    validateNotAlreadyVoted,
  ]
    .map(validator => validator(request, context))
    .filter((error): error is string => error !== null);

  if (genericErrors.length > 0) {
    return { isValid: false, errors: genericErrors };
  }

  // 4. Poll-type-specific business logic via registry
  if (context.poll) {
    const typeError = handler.validateVoteAgainstPoll(request.vote, context.poll.details);
    if (typeError) {
      return { isValid: false, errors: [typeError] };
    }
  }

  return { isValid: true };
};

// Export individual validators for potential reuse
export {
  validatePollExists,
  validateNotAuthor,
  validateNotExpired,
  validateHasAccess,
  validateNotAlreadyVoted,
};