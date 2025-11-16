import { z } from 'zod';
import { PollType, PollScope, VotePrivacy, MediaType } from './poll.types';

// Base enum schemas
export const PollTypeSchema = z.nativeEnum(PollType);
export const PollScopeSchema = z.nativeEnum(PollScope);
export const VotePrivacySchema = z.nativeEnum(VotePrivacy);
export const MediaTypeSchema = z.nativeEnum(MediaType);

// Media asset schema
export const MediaAssetSchema = z.object({
  type: MediaTypeSchema,
  value: z.string().min(1, 'Media value is required')
});

// Base poll request schema (common fields across all commands)
export const BasePollRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pollId: z.string().min(1, 'Poll ID is required').optional()
});

// Create poll base schema
export const CreatePollBaseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: PollTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  expireTimestamp: z.string().optional(),
  sharedWith: z.array(z.string()).default([]),
  votePrivacy: VotePrivacySchema
});

// Vote base schema
export const VoteBaseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pollId: z.string().min(1, 'Poll ID is required')
});

// Aggregate vote base schema
export const AggregateVoteBaseSchema = z.object({
  participant: z.object({
    pollId: z.string().min(1, 'Poll ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    type: PollTypeSchema,
    scope: PollScopeSchema,
    vote: z.any() // This will be refined by poll-type-specific schemas
  })
});

// Validation context schemas
export const BaseValidationContextSchema = z.object({
  currentTime: z.number().positive('Current time must be positive')
});

export const CreatePollValidationContextSchema = BaseValidationContextSchema.extend({
  // Add any create-poll-specific context fields here
});

export const VoteValidationContextSchema = BaseValidationContextSchema.extend({
  poll: z.object({
    userId: z.string(),
    expireTimestamp: z.number(),
    scope: PollScopeSchema,
    sharedWith: z.array(z.string())
  }).optional(),
  existingParticipant: z.object({
    voteTimestamp: z.number().optional()
  }).optional()
});

export const AggregateVoteValidationContextSchema = BaseValidationContextSchema.extend({
  pollResults: z.any().optional() // Poll results structure varies by type
});