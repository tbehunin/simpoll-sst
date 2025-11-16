import { z } from 'zod';
import { 
  CreatePollBaseSchema, 
  VoteBaseSchema, 
  AggregateVoteBaseSchema,
  MediaAssetSchema 
} from '../common/validation.schemas';
import { 
  ValidationResult, 
  CommandType, 
  ValidationSchemaRegistry,
  BusinessLogicValidator,
  validateWithSchema,
  combineValidationResults
} from '../common/validation.types';
import { CreatePollRequest } from '../services/poll/commands/create-poll/create-poll.types';
import { VoteRequest } from '../services/poll/commands/vote/vote.types';
import { AggregateVoteRequest } from '../services/poll/commands/aggregate-vote/aggregate-vote.types';
import { PollType } from '../common/poll.types';

// Multiple Choice specific schemas
export const MultipleChoiceChoiceSchema = z.object({
  text: z.string().min(1, 'Choice text is required').max(100, 'Choice text must be 100 characters or less'),
  media: MediaAssetSchema.optional()
});

export const MultipleChoiceDetailSchema = z.object({
  multiSelect: z.boolean(),
  choices: z.array(MultipleChoiceChoiceSchema)
    .min(2, 'At least 2 choices are required')
    .max(10, 'Maximum 10 choices allowed')
});

export const MultipleChoiceParticipantSchema = z.object({
  selectedIndex: z.array(z.number().int().min(0))
    .min(1, 'At least one choice must be selected')
});

// Command-specific schemas for Multiple Choice
export const MultipleChoiceCreatePollSchema = CreatePollBaseSchema.extend({
  type: z.literal(PollType.MultipleChoice),
  details: MultipleChoiceDetailSchema
});

export const MultipleChoiceVoteSchema = VoteBaseSchema.extend({
  type: z.literal(PollType.MultipleChoice),
  vote: MultipleChoiceParticipantSchema
});

export const MultipleChoiceAggregateVoteSchema = AggregateVoteBaseSchema.extend({
  participant: z.object({
    pollId: z.string().min(1, 'Poll ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    type: z.literal(PollType.MultipleChoice),
    scope: z.any(), // PollScope enum
    vote: MultipleChoiceParticipantSchema
  })
});

// Schema registry for Multiple Choice
export const multipleChoiceValidationSchemas: ValidationSchemaRegistry<any> = {
  [CommandType.CreatePoll]: MultipleChoiceCreatePollSchema,
  [CommandType.Vote]: MultipleChoiceVoteSchema,
  [CommandType.AggregateVote]: MultipleChoiceAggregateVoteSchema
};

// Business logic validators for Multiple Choice
export const validateMultipleChoiceCreatePollBusinessLogic: BusinessLogicValidator<
  CreatePollRequest<PollType.MultipleChoice>, 
  any
> = (request, context) => {
  const errors: any[] = [];
  
  // Validate choice text uniqueness
  const choiceTexts = request.details.choices.map(choice => choice.text.toLowerCase().trim());
  const uniqueTexts = new Set(choiceTexts);
  if (uniqueTexts.size !== choiceTexts.length) {
    errors.push({
      field: 'details.choices',
      message: 'Choice texts must be unique',
      code: 'duplicate_choices'
    });
  }
  
  return errors.length === 0
    ? { success: true, data: null }
    : { success: false, errors };
};

export const validateMultipleChoiceVoteBusinessLogic: BusinessLogicValidator<
  VoteRequest<PollType.MultipleChoice>, 
  any
> = (request, context) => {
  const errors: any[] = [];
  
  // This would be populated with poll details from context in real implementation
  const pollDetails = context.poll?.details;
  
  if (pollDetails) {
    const maxChoices = pollDetails.choices?.length || 0;
    const selectedIndices = request.vote.selectedIndex || [];
    
    // Validate selected indices are within bounds
    const invalidIndices = selectedIndices.filter(index => index >= maxChoices);
    if (invalidIndices.length > 0) {
      errors.push({
        field: 'vote.selectedIndex',
        message: `Invalid choice indices: ${invalidIndices.join(', ')}`,
        code: 'invalid_choice_index'
      });
    }
    
    // Validate multi-select rules
    if (!pollDetails.multiSelect && selectedIndices.length > 1) {
      errors.push({
        field: 'vote.selectedIndex',
        message: 'Only one choice allowed for single-select polls',
        code: 'multiple_choices_not_allowed'
      });
    }
    
    // Validate no duplicate selections
    const uniqueSelections = new Set(selectedIndices);
    if (uniqueSelections.size !== selectedIndices.length) {
      errors.push({
        field: 'vote.selectedIndex',
        message: 'Duplicate choice selections not allowed',
        code: 'duplicate_selections'
      });
    }
  }
  
  return errors.length === 0
    ? { success: true, data: null }
    : { success: false, errors };
};

export const validateMultipleChoiceAggregateVoteBusinessLogic: BusinessLogicValidator<
  AggregateVoteRequest, 
  any
> = (request, context) => {
  const errors: any[] = [];
  
  const vote = request.participant.vote as any; // MultipleChoiceParticipant
  
  if (!vote?.selectedIndex || vote.selectedIndex.length === 0) {
    errors.push({
      field: 'participant.vote.selectedIndex',
      message: 'No choices selected for aggregation',
      code: 'no_choices_selected'
    });
  }
  
  return errors.length === 0
    ? { success: true, data: null }
    : { success: false, errors };
};