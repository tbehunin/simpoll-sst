import { createSimpleCommand } from './command-builder';
import { validateCreatePoll } from '../validation/poll-validation';
import { CreatePollRequest } from '../types';
import { PollType } from '../../../common/types';
import { PollDetailMapper, PollResultMapper, PollVoterMapper } from '../mappers';
import { dbClient } from '../../../data/dbClient';
import { v4 as uuidv4 } from 'uuid';

// Pure executor function
const executeCreatePoll = async (request: CreatePollRequest<PollType>): Promise<string> => {
  const pollId = uuidv4();
  const now = new Date().toISOString();
  
  const pollDetailDoc = PollDetailMapper.fromCreateRequest(pollId, now, request);
  const pollResultDoc = PollResultMapper.fromCreateRequest(pollId, request);
  const pollVoterDocs = PollVoterMapper.fromCreateRequest(pollId, request);
  
  // Ensure pollVoterDocs is always treated as an array for spreading
  const pollVoterDocsArray = Array.isArray(pollVoterDocs) ? pollVoterDocs : [pollVoterDocs];
  
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollVoterDocsArray]);
  return pollId;
};

// Composed command
export const createPollCommand = createSimpleCommand(
  validateCreatePoll,
  executeCreatePoll
);