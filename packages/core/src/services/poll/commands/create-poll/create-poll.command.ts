import { createContextCommand } from '../command-builder';
import { createCreatePollContext, CreatePollValidationContext } from './create-poll.context';
import { validateCreatePoll } from './create-poll.validation';
import { CreatePollRequest } from './create-poll.types';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailMapper } from '../../details';
import { PollResultMapper } from '../../results';
import { PollParticipantMapper } from '../../participants';
import { dbClient } from '@simpoll-sst/core/data';
import { v4 as uuidv4 } from 'uuid';

// Pure executor function
const executeCreatePoll = async (
  request: CreatePollRequest<PollType>,
  context: CreatePollValidationContext
): Promise<string> => {
  const pollId = uuidv4();
  const now = context.currentTime;
  
  const pollDetailDoc = PollDetailMapper.fromCreateRequest(pollId, now, request);
  const pollResultDoc = PollResultMapper.fromCreateRequest(pollId, request);
  const pollParticipantDocs = PollParticipantMapper.fromCreateRequest(pollId, request);
  
  // Ensure pollParticipantDocs is always treated as an array for spreading
  const pollParticipantDocsArray = Array.isArray(pollParticipantDocs) ? pollParticipantDocs : [pollParticipantDocs];
  
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollParticipantDocsArray]);
  return pollId;
};

// Composed command using context pattern
export const createPollCommand = createContextCommand(
  createCreatePollContext,
  validateCreatePoll,
  executeCreatePoll
);