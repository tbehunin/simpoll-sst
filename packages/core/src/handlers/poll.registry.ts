import { PollDetailMap, PollResultMap, PollType, PollParticipantMap, PollScope } from '../common/poll.types';
import { UpdateRequest } from '../data/db.client';
import { CreatePollRequest } from '../services/poll/commands/create-poll/create-poll.types';
import { VoteRequest } from '../services/poll/commands/vote/vote.types';
import { AggregateVoteRequest } from '../services/poll/commands/aggregate-vote/aggregate-vote.types';
import {
  ValidationResult,
  CommandType,
  ValidationSchemaRegistry,
  BusinessLogicValidator
} from '../common/validation.types';
import { multipleChoiceHandler } from './multiple-choice.handler';

export interface PollTypeHandler<T extends PollType> {
  // Existing parsing and building methods
  parseDetails(details: any): PollDetailMap[T];
  parseResults(results: any): PollResultMap[T];
  parseParticipant(Participant: any): PollParticipantMap[T];
  parseVoteStream(voteStream: any): PollParticipantMap[T];
  buildResults(request: CreatePollRequest<PollType>): PollResultMap[T];
  buildAggregateVoteUpdateRequest(pollId: string, userId: string, scope: PollScope, vote: PollParticipantMap[T]): UpdateRequest;
  
  // New validation methods
  getValidationSchemas(): ValidationSchemaRegistry<any>;
  validateCreatePollBusinessLogic?: BusinessLogicValidator<CreatePollRequest<T>, any>;
  validateVoteBusinessLogic?: BusinessLogicValidator<VoteRequest<T>, any>;
  validateAggregateVoteBusinessLogic?: BusinessLogicValidator<AggregateVoteRequest, any>;
};

const pollRegistry: Partial<Record<PollType, PollTypeHandler<PollType>>> = {};

export const registerPollType = (type: PollType, handler: PollTypeHandler<PollType>) => {
  pollRegistry[type] = handler;
};

export const getPollTypeHandler = (type: PollType) => {
  const handler = pollRegistry[type];
  if (!handler) throw new Error(`No handler registered for poll type: ${type}`);
  return handler;
};

registerPollType(PollType.MultipleChoice, multipleChoiceHandler);
