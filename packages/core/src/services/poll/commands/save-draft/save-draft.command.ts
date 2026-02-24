import { createContextCommand } from '../command-builder';
import { createSaveDraftContext, SaveDraftValidationContext } from './save-draft.context';
import { validateSaveDraft } from './save-draft.validation';
import { SaveDraftRequest } from './save-draft.types';
import { PollType, VotePrivacy } from '@simpoll-sst/core/common';
import { PollDetailMapper } from '../../details';
import { dbClient } from '@simpoll-sst/core/data';
import { v4 as uuidv4 } from 'uuid';

// Pure executor function
const executeSaveDraft = async (
  request: SaveDraftRequest<PollType>,
  context: SaveDraftValidationContext
): Promise<string> => {
  const pollId = request.pollId || uuidv4();
  const now = context.currentTime;
  
  // Transform request to CreatePollRequest-like structure with defaults for optional fields
  const normalizedRequest = {
    userId: request.userId,
    type: request.type,
    title: request.title || '',  // Empty title if not provided
    expireTimestamp: request.expireTimestamp,
    sharedWith: request.sharedWith || [],
    votePrivacy: request.votePrivacy || VotePrivacy.Anonymous,  // Default to Anonymous
    details: request.details || {} as any,  // Empty details if not provided
  };

  // Create only the detail entity for drafts (isDraft=true)
  // Results and participants will be created when publishing (Phase 8)
  const pollDetailDoc = PollDetailMapper.fromCreateRequest(
    pollId, 
    now, 
    normalizedRequest,
    true
  );

  await dbClient.put(pollDetailDoc);
  return pollId;
};

// Composed command using context pattern
export const saveDraftCommand = createContextCommand(
  createSaveDraftContext,
  validateSaveDraft,
  executeSaveDraft);

