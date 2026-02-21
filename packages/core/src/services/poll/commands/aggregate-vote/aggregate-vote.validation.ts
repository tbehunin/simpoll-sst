import { z } from 'zod';
import { AggregateVoteRequest } from './aggregate-vote.types';
import { AggregateVoteValidationContext } from './aggregate-vote.context';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { 
  ValidationResult, 
  zodToValidationResult,
  PollTypeSchema,
  PollScopeSchema,
  UuidSchema,
  NonEmptyStringSchema,
} from '../validation.utils';

// Base participant schema (vote data validated via registry)
const PollParticipantBaseSchema = z.object({
  pollId: UuidSchema,
  userId: NonEmptyStringSchema,
  type: PollTypeSchema,
  scope: PollScopeSchema,
  voted: z.boolean(),
  expireTimestamp: z.string().min(1, 'Expire timestamp is required'),
  voteTimestamp: z.string().optional(),
});

// --- Generic business logic validators ---

const validatePollResultsExist = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): string | null => {
  return context.pollResults 
    ? null
    : 'Poll results not found';
};

const validateVoteDataIntegrity = (
  request: AggregateVoteRequest,
  _context: AggregateVoteValidationContext
): string | null => {
  const { participant } = request;

  if (!participant.voteTimestamp) {
    return 'Participant has not voted yet';
  }

  if (!participant.vote) {
    return 'Vote data is missing';
  }

  return null;
};

const validateParticipantConsistency = (
  request: AggregateVoteRequest,
  _context: AggregateVoteValidationContext
): string | null => {
  const { participant } = request;

  if (participant.vote && !participant.voted) {
    return 'Participant has vote data but is not marked as voted';
  }

  if (participant.voted && !participant.voteTimestamp) {
    return 'Participant is marked as voted but has no vote timestamp';
  }

  return null;
};

// Main validation function
export const validateAggregateVote = (
  request: AggregateVoteRequest,
  context: AggregateVoteValidationContext
): ValidationResult => {
  // 1. Validate common participant fields
  const baseValidation = zodToValidationResult(PollParticipantBaseSchema, request.participant);
  if (!baseValidation.isValid) return baseValidation;

  // 2. Validate vote data structure via registry
  const handler = getPollTypeHandler(request.participant.type);
  if (request.participant.vote) {
    const voteValidation = zodToValidationResult(handler.getVoteSchema(), request.participant.vote);
    if (!voteValidation.isValid) return voteValidation;
  }

  // 3. Generic business logic validators
  const errors = [
    validatePollResultsExist,
    validateVoteDataIntegrity,
    validateParticipantConsistency,
  ]
    .map(validator => validator(request, context))
    .filter((error): error is string => error !== null);

  return errors.length === 0
    ? { isValid: true }
    : { isValid: false, errors };
};

// Export individual validators for potential reuse
export {
  validatePollResultsExist,
  validateVoteDataIntegrity,
  validateParticipantConsistency
};
