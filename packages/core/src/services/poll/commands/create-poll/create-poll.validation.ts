import { z } from 'zod';
import { CreatePollRequest } from './create-poll.types';
import { CreatePollValidationContext } from './create-poll.context';
import { PollType } from '../../../../common/poll.types';
import { getPollTypeHandler } from '../../../../handlers/poll.registry';
import { 
  ValidationResult, 
  zodToValidationResult,
  PollTypeSchema,
  VotePrivacySchema,
  UuidSchema,
  NonEmptyStringSchema,
  TimestampSchema,
} from '../validation.utils';

// Base schema for common fields (details validated via registry)
const CreatePollRequestBaseSchema = z.object({
  userId: UuidSchema,
  type: PollTypeSchema,
  title: NonEmptyStringSchema,
  expireTimestamp: TimestampSchema.optional(),
  sharedWith: z.array(UuidSchema).default([]),
  votePrivacy: VotePrivacySchema,
});

// Business logic: expiration must be in the future
const validateExpiration = (
  request: CreatePollRequest<PollType>,
  context: CreatePollValidationContext
): string | null => {
  if (!request.expireTimestamp) return null;

  const expireTime = typeof request.expireTimestamp === 'string'
    ? new Date(request.expireTimestamp).getTime()
    : request.expireTimestamp;

  const currentTime = new Date(context.currentTime).getTime();

  return expireTime > currentTime
    ? null
    : 'Expiration timestamp must be in the future';
};

// Main validation function
export const validateCreatePoll = (
  request: CreatePollRequest<PollType>, 
  context: CreatePollValidationContext
): ValidationResult => {
  // 1. Validate common request fields
  const baseValidation = zodToValidationResult(CreatePollRequestBaseSchema, request);
  if (!baseValidation.isValid) return baseValidation;

  // 2. Validate poll-type-specific details via registry
  const handler = getPollTypeHandler(request.type);
  const detailsValidation = zodToValidationResult(handler.getDetailSchema(), request.details);
  if (!detailsValidation.isValid) return detailsValidation;

  // 3. Business logic validators
  const errors = [
    validateExpiration(request, context),
  ].filter((error): error is string => error !== null);

  return errors.length === 0
    ? { isValid: true }
    : { isValid: false, errors };
};