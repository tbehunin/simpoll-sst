import { z } from 'zod';
import { PollDetailMap, PollResultMap, PollType, PollParticipantMap, PollScope } from '@simpoll-sst/core/common';
import { UpdateRequest } from '@simpoll-sst/core/data';
import { CreatePollRequest } from '@simpoll-sst/core/services/poll/commands/create-poll/create-poll.types';
import { multipleChoiceHandler } from './multiple-choice.handler';
import { NotFoundError } from '@simpoll-sst/core/errors';

export interface PollTypeHandler<T extends PollType> {
  // Parsing
  parseDetails(details: any): PollDetailMap[T];
  parseResults(results: any): PollResultMap[T];
  parseParticipant(participant: any): PollParticipantMap[T];
  parseVoteStream(voteStream: any): PollParticipantMap[T];

  // Building
  buildResults(request: CreatePollRequest<PollType>): PollResultMap[T];
  buildAggregateVoteUpdateRequest(pollId: string, userId: string, scope: PollScope, vote: PollParticipantMap[T]): UpdateRequest;

  // Validation schemas (Zod)
  getDetailSchema(): z.ZodSchema<PollDetailMap[T]>;
  getVoteSchema(): z.ZodSchema<PollParticipantMap[T]>;
  validateVoteAgainstPoll(vote: PollParticipantMap[T], pollDetails: PollDetailMap[T]): string | null;
};

const pollRegistry: Partial<Record<PollType, PollTypeHandler<PollType>>> = {};

export const registerPollType = (type: PollType, handler: PollTypeHandler<PollType>) => {
  pollRegistry[type] = handler;
};

export const getPollTypeHandler = (type: PollType) => {
  const handler = pollRegistry[type];
  if (!handler) throw new NotFoundError('Poll type handler', type);
  return handler;
};

registerPollType(PollType.MultipleChoice, multipleChoiceHandler);
