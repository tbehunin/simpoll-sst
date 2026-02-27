import { z } from 'zod';
import { PublishPollRequest } from './publish-poll.types';
import { PublishPollValidationContext } from './publish-poll.context';
import { PollScope } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { 
  ValidationResult, 
  zodToValidationResult,
  UuidSchema,
  NonEmptyStringSchema,
  TimestampSchema,
} from '../validation.utils';

// Base schema for publish request
const PublishPollRequestSchema = z.object({
  pollId: UuidSchema,
  userId: NonEmptyStringSchema,
});

// --- Business logic validators ---

const validatePollExists = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  return context.existingPoll
    ? null
    : `Draft poll with id ${request.pollId} not found`;
};

const validateIsDraft = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  if (!context.existingPoll) return null; // Already handled by validatePollExists
  
  return context.existingPoll.scope === PollScope.Draft
    ? null
    : 'Only draft polls can be published';
};

const validateIsAuthor = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  if (!context.existingPoll) return null; // Already handled by validatePollExists
  
  return context.existingPoll.userId === request.userId
    ? null
    : 'Only the poll author can publish this draft';
};

const validateTitle = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  if (!context.existingPoll) return null;
  
  return context.existingPoll.title && context.existingPoll.title.trim().length > 0
    ? null
    : 'Title is required to publish a poll';
};

const validateExpiration = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  if (!context.existingPoll || !context.existingPoll.expireTimestamp) {
    return null; // Optional field
  }

  const expireTime = new Date(context.existingPoll.expireTimestamp).getTime();
  const currentTime = new Date(context.currentTime).getTime();

  return expireTime <= currentTime
    ? 'Expiration time must be in the future'
    : null;
};

const validateDetails = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): string | null => {
  if (!context.existingPoll) return null;

  const handler = getPollTypeHandler(context.existingPoll.type);
  const detailSchema = handler.getDetailSchema();
  
  const validationResult = detailSchema.safeParse(context.existingPoll.details);
  
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
    return `Poll details are incomplete: ${errors}`;
  }

  return null;
};

// --- Main validator ---

export const validatePublishPoll = (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): ValidationResult => {
  // Schema validation
  const schemaResult = zodToValidationResult(PublishPollRequestSchema, request);
  if (!schemaResult.isValid) {
    return schemaResult;
  }

  // Business logic validations
  const errors: string[] = [];

  const pollExistsError = validatePollExists(request, context);
  if (pollExistsError) {
    errors.push(pollExistsError);
    return { isValid: false, errors }; // Early return if poll doesn't exist
  }

  const isDraftError = validateIsDraft(request, context);
  if (isDraftError) errors.push(isDraftError);

  const isAuthorError = validateIsAuthor(request, context);
  if (isAuthorError) errors.push(isAuthorError);

  const titleError = validateTitle(request, context);
  if (titleError) errors.push(titleError);

  const expirationError = validateExpiration(request, context);
  if (expirationError) errors.push(expirationError);

  const detailsError = validateDetails(request, context);
  if (detailsError) errors.push(detailsError);

  return errors.length > 0
    ? { isValid: false, errors }
    : { isValid: true };
};
