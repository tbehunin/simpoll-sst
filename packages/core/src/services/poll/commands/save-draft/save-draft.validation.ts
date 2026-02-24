import { z } from 'zod';
import { SaveDraftRequest } from './save-draft.types';
import { SaveDraftValidationContext } from './save-draft.context';
import { PollType } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { 
  ValidationResult, 
  zodToValidationResult,
  PollTypeSchema,
  VotePrivacySchema,
  UuidSchema,
  NonEmptyStringSchema,
  TimestampSchema,
} from '../validation.utils';

// Lenient base schema for drafts - most fields optional
const SaveDraftRequestBaseSchema = z.object({
  pollId: UuidSchema.optional(),  // Optional: create new if not provided
  userId: NonEmptyStringSchema,
  type: PollTypeSchema,
  title: NonEmptyStringSchema.optional(),  // Lenient: title optional for drafts
  expireTimestamp: TimestampSchema.optional(),
  sharedWith: z.array(UuidSchema).optional(),
  votePrivacy: VotePrivacySchema.optional(),
  // details validated separately below with lenient rules
});

// --- Schema validator ---

const validateSchema = (
  request: SaveDraftRequest<PollType>,
  context: SaveDraftValidationContext
): ValidationResult => {
  // Validate base fields
  const baseResult = zodToValidationResult(SaveDraftRequestBaseSchema, request);
  if (!baseResult.isValid) {
    return baseResult;
  }

  // For drafts, details validation is lenient - we skip strict schema validation
  // Details will be validated strictly when publishing via publishPoll mutation (Phase 8)

  return { isValid: true };
};

// --- Business logic validators ---

// Lenient expiration check: if provided, should be in future, but not required
const validateExpiration = (
  request: SaveDraftRequest<PollType>,
  context: SaveDraftValidationContext
): string | null => {
  if (!request.expireTimestamp) {
    return null;  // Optional for drafts
  }

  const expireTime = new Date(request.expireTimestamp).getTime();
  const currentTime = new Date(context.currentTime).getTime();

  return expireTime <= currentTime
    ? 'Expiration time must be in the future'
    : null;
};

// --- Main validator ---

export const validateSaveDraft = (
  request: SaveDraftRequest<PollType>,
  context: SaveDraftValidationContext
): ValidationResult => {
  // Schema validation
  const schemaResult = validateSchema(request, context);
  if (!schemaResult.isValid) {
    return schemaResult;
  }

  // Business logic validations
  const errors: string[] = [];

  const expirationError = validateExpiration(request, context);
  if (expirationError) {
    errors.push(expirationError);
  }

  return errors.length > 0
    ? { isValid: false, errors }
    : { isValid: true };
};
