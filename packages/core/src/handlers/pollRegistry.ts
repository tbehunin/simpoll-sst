import { PollDetailMap, PollResultMap, PollType, PollParticipantMap, PollScope } from '../common/types';
import { UpdateRequest } from '../data/dbClient';
import { CreatePollRequest } from '../services/poll/commands/create-poll/types';
import { multipleChoiceHandler } from './multipleChoiceHandler';



export interface PollTypeHandler<T extends PollType> {
  parseDetails(details: any): PollDetailMap[T];
  parseResults(results: any): PollResultMap[T];
  parseParticipant(Participant: any): PollParticipantMap[T];
  parseVoteStream(voteStream: any): PollParticipantMap[T];
  buildResults(request: CreatePollRequest<PollType>): PollResultMap[T];
  buildAggregateVoteUpdateRequest(pollId: string, userId: string, scope: PollScope, vote: PollParticipantMap[T]): UpdateRequest;
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
