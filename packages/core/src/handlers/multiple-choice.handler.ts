import { z } from 'zod';
import { MediaAsset, MediaType, PollType, PollScope } from '../common/poll.types';
import { CreatePollRequest } from '../services/poll/commands/create-poll/create-poll.types';
import { PollTypeHandler } from './poll.registry';
import { UpdateRequest } from '../data/db.client';

export interface Choice {
  text: string
  media?: MediaAsset
};
export interface MultipleChoiceDetail {
  multiSelect: boolean
  choices: Choice[]
};
export interface ChoiceResult {
  votes: number
  users: string[]
};
export interface MultipleChoiceResult {
  choices: ChoiceResult[]
};
export interface MultipleChoiceParticipant {
  selectedIndex?: number[]
};

// --- Zod schemas for MultipleChoice ---

const MediaTypeSchema = z.nativeEnum(MediaType, {
  message: 'Invalid media type'
});

const MediaAssetSchema = z.object({
  type: MediaTypeSchema,
  value: z.string().min(1, 'Media value is required')
});

const ChoiceSchema = z.object({
  text: z.string().min(1, 'Choice text is required'),
  media: MediaAssetSchema.optional()
});

const MultipleChoiceDetailSchema = z.object({
  multiSelect: z.boolean(),
  choices: z.array(ChoiceSchema).min(2, 'At least 2 choices are required')
});

const MultipleChoiceVoteSchema = z.object({
  selectedIndex: z.array(z.number().int().min(0)).min(1, 'At least one choice must be selected')
});

export const multipleChoiceHandler: PollTypeHandler<PollType.MultipleChoice> = {
  parseDetails: (details: any): MultipleChoiceDetail => ({
    multiSelect: details.multiSelect,
    choices: details.choices.map((choice: any) => ({
      text: choice.text,
      ...(choice.media && { media: choice.media }) // Handle optional property
    }))
  }),
  parseResults: (results: any): MultipleChoiceResult => ({
    choices: results.choices.map((choice: any) => ({
      votes: choice.votes,
      users: choice.users
    }))
  }),
  parseParticipant: (participant: any): MultipleChoiceParticipant => ({
    selectedIndex: participant.selectedIndex,
  }),
  buildResults: (request: CreatePollRequest<PollType>): MultipleChoiceResult => ({
    choices: request.details.choices.map(() => ({
      votes: 0,
      users: []
    }))
  }),
  parseVoteStream: (voteStream: any): MultipleChoiceParticipant => ({
    selectedIndex: (voteStream?.M?.selectedIndex?.L || []).map((item: any) => parseInt(item.N, 10)),
  }),
  buildAggregateVoteUpdateRequest: (pollId: string, userId: string, scope: PollScope, vote: MultipleChoiceParticipant): UpdateRequest => {
    if (!vote?.selectedIndex || vote.selectedIndex.length === 0) {
      throw new Error('No choices selected for vote aggregation');
    }

    const addExpressions: string[] = [];
    const setExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    // ADD operation for totalVotes increment
    addExpressions.push('totalVotes :inc');
    expressionAttributeValues[':inc'] = 1;

    // Process each selected choice
    vote.selectedIndex.forEach((choiceIndex, i) => {
      // ADD operation for vote count (atomic increment)
      addExpressions.push(`#results.#choices[${choiceIndex}].#votes :inc`);
      expressionAttributeNames['#results'] = 'results';
      expressionAttributeNames['#choices'] = 'choices';
      expressionAttributeNames['#votes'] = 'votes';
      
      // list_append for users array (only for private polls)
      if (scope === PollScope.Private) {
        setExpressions.push(`#results.#choices[${choiceIndex}].#users = list_append(if_not_exists(#results.#choices[${choiceIndex}].#users, :empty_list), :user${i})`);
        expressionAttributeNames['#users'] = 'users';
        expressionAttributeValues[`:user${i}`] = [userId];
      }
    });

    // Add empty list for list_append operations
    if (scope === PollScope.Private) {
      expressionAttributeValues[':empty_list'] = [];
    }

    // Build the UpdateExpression with proper separation
    const updateExpressionParts: string[] = [];
    
    if (addExpressions.length > 0) {
      updateExpressionParts.push(`ADD ${addExpressions.join(', ')}`);
    }
    
    if (setExpressions.length > 0) {
      updateExpressionParts.push(`SET ${setExpressions.join(', ')}`);
    }

    return {
      Key: { pk: `Poll#${pollId}`, sk: 'Results' },
      UpdateExpression: updateExpressionParts.join(' '),
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    };
  },

  // --- Validation schema methods ---

  getDetailSchema: () => MultipleChoiceDetailSchema,

  getVoteSchema: () => MultipleChoiceVoteSchema,

  validateVoteAgainstPoll: (vote: MultipleChoiceParticipant, pollDetails: MultipleChoiceDetail): string | null => {
    if (!vote.selectedIndex || vote.selectedIndex.length === 0) {
      return 'At least one choice must be selected';
    }

    const maxIndex = pollDetails.choices.length - 1;
    const invalidIndices = vote.selectedIndex.filter(index => index < 0 || index > maxIndex);
    if (invalidIndices.length > 0) {
      return `Invalid choice indices: ${invalidIndices.join(', ')}`;
    }

    if (!pollDetails.multiSelect && vote.selectedIndex.length > 1) {
      return 'Multiple selections are not allowed for this poll';
    }

    return null;
  }
};
