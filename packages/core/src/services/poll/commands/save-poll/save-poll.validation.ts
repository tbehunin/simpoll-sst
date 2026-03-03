import { z } from 'zod';
import { SavePollRequest } from './save-poll.types';
import { SavePollValidationContext } from './save-poll.context';
import { PollType, PollScope } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { 
  ValidationResult, zodToValidationResult, PollTypeSchema, VotePrivacySchema,
  UuidSchema, NonEmptyStringSchema, TimestampSchema,
} from '../validation.utils';

// Base schema - always required
const SavePollRequestBaseSchema = z.object({
  userId: NonEmptyStringSchema,
  type: PollTypeSchema,
  publish: z.boolean(),
  pollId: UuidSchema.optional(),
});

// Optional field schemas for draft validation
const OptionalFieldSchemas = {
  title: NonEmptyStringSchema.optional(),
  expireTimestamp: TimestampSchema.optional(),
  sharedWith: z.array(UuidSchema).optional(),
  votePrivacy: VotePrivacySchema.optional(),
};

// Required field schemas for publish validation
const RequiredFieldSchemas = {
  title: NonEmptyStringSchema,
  sharedWith: z.array(UuidSchema).default([]),
  votePrivacy: VotePrivacySchema,
};

const validatePollExists = (req: SavePollRequest<PollType>, ctx: SavePollValidationContext): string | null => {
  if (!req.pollId) return null;
  return ctx.existingPoll ? null : `Poll with id ${req.pollId} not found`;
};

const validateNotPublished = (req: SavePollRequest<PollType>, ctx: SavePollValidationContext): string | null => {
  if (!ctx.existingPoll) return null;
  return ctx.existingPoll.scope === PollScope.Draft 
    ? null 
    : 'Cannot modify a published poll';
};

const validateIsAuthor = (req: SavePollRequest<PollType>, ctx: SavePollValidationContext): string | null => {
  if (!ctx.existingPoll) return null;
  return ctx.existingPoll.userId === req.userId 
    ? null 
    : 'Only the poll author can modify this poll';
};

const validateExpiration = (req: SavePollRequest<PollType>, ctx: SavePollValidationContext): string | null => {
  if (!req.expireTimestamp) return null;
  const expireTime = new Date(req.expireTimestamp).getTime();
  const currentTime = new Date(ctx.currentTime).getTime();
  return expireTime > currentTime ? null : 'Expiration timestamp must be in the future';
};

const validateRequiredFieldsForPublish = (req: SavePollRequest<PollType>): string[] => {
  const errors: string[] = [];
  
  if (!req.title || req.title.trim().length === 0) {
    errors.push('Title is required to publish a poll');
  }
  
  if (req.sharedWith === undefined) {
    errors.push('sharedWith is required to publish a poll');
  }
  
  if (!req.votePrivacy) {
    errors.push('votePrivacy is required to publish a poll');
  }
  
  if (!req.details) {
    errors.push('Poll details are required to publish a poll');
  }
  
  return errors;
};

const validateDraftFields = (req: SavePollRequest<PollType>): ValidationResult => {
  // Validate only the fields that are present
  const fieldsToValidate: any = {
    userId: req.userId,
    type: req.type,
    publish: req.publish,
  };
  
  if (req.pollId !== undefined) fieldsToValidate.pollId = req.pollId;
  if (req.title !== undefined) fieldsToValidate.title = req.title;
  if (req.expireTimestamp !== undefined) fieldsToValidate.expireTimestamp = req.expireTimestamp;
  if (req.sharedWith !== undefined) fieldsToValidate.sharedWith = req.sharedWith;
  if (req.votePrivacy !== undefined) fieldsToValidate.votePrivacy = req.votePrivacy;
  
  const schema = SavePollRequestBaseSchema.extend(OptionalFieldSchemas);
  return zodToValidationResult(schema, fieldsToValidate);
};

const validatePublishFields = (req: SavePollRequest<PollType>): ValidationResult => {
  const schema = SavePollRequestBaseSchema.extend(RequiredFieldSchemas);
  return zodToValidationResult(schema, req);
};

const validateDetails = (req: SavePollRequest<PollType>): string | null => {
  if (!req.details) return null;
  
  const handler = getPollTypeHandler(req.type);
  const validationResult = handler.getDetailSchema().safeParse(req.details);
  
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
    return `Poll details are invalid: ${errors}`;
  }
  
  return null;
};

export const validateSavePoll = (
  request: SavePollRequest<PollType>,
  context: SavePollValidationContext
): ValidationResult => {
  const errors: string[] = [];
  
  // Validate that poll exists if pollId is provided
  const pollExistsError = validatePollExists(request, context);
  if (pollExistsError) {
    errors.push(pollExistsError);
    return { isValid: false, errors };
  }
  
  // Validate authorization if updating existing poll
  const notPublishedError = validateNotPublished(request, context);
  if (notPublishedError) errors.push(notPublishedError);
  
  const isAuthorError = validateIsAuthor(request, context);
  if (isAuthorError) errors.push(isAuthorError);
  
  // If we already have authorization errors, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Validate based on publish flag
  if (request.publish) {
    // Publishing: strict validation
    const requiredFieldsErrors = validateRequiredFieldsForPublish(request);
    errors.push(...requiredFieldsErrors);
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    const fieldsValidation = validatePublishFields(request);
    if (!fieldsValidation.isValid) return fieldsValidation;
    
    const detailsError = validateDetails(request);
    if (detailsError) errors.push(detailsError);
  } else {
    // Draft: lenient validation (only validate fields that are present)
    const fieldsValidation = validateDraftFields(request);
    if (!fieldsValidation.isValid) return fieldsValidation;
    
    // Validate details if present
    const detailsError = validateDetails(request);
    if (detailsError) errors.push(detailsError);
  }
  
  // Always validate expiration if provided
  const expirationError = validateExpiration(request, context);
  if (expirationError) errors.push(expirationError);
  
  return errors.length > 0 ? { isValid: false, errors } : { isValid: true };
};
