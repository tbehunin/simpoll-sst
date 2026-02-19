import { z } from 'zod';
import { PollType, PollScope, VotePrivacy } from '@simpoll-sst/core/common';

// Validation result type to maintain compatibility with existing command builder
export type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };

// Helper function to convert Zod validation result to our ValidationResult format
export const zodToValidationResult = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    errors: result.error.issues.map(err =>
      err.path.length > 0
        ? `${err.path.join('.')}: ${err.message}`
        : err.message
    )
  };
};

// Base enum schemas
export const PollTypeSchema = z.nativeEnum(PollType, {
  message: 'Poll type is required'
});

export const PollScopeSchema = z.nativeEnum(PollScope, {
  message: 'Invalid poll scope'
});

export const VotePrivacySchema = z.nativeEnum(VotePrivacy, {
  message: 'Invalid vote privacy setting'
});

// Common field schemas
export const UuidSchema = z.string().uuid('Invalid UUID format');

export const NonEmptyStringSchema = z.string().min(1).trim();

export const TimestampSchema = z.union([
  z.string().min(1, 'Timestamp is required'),
  z.number().positive('Timestamp must be positive')
]);