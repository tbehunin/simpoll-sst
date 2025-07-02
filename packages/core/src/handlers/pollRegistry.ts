import { PollDetailMap, PollResultMap, PollType, PollVoteMap } from "../common/types";
import { CreatePollRequest } from "../services/types";
import { multipleChoiceHandler } from "./multipleChoiceHandler";



export interface PollTypeHandler<T extends PollType> {
  parseDetails(details: any): PollDetailMap[T];
  parseResults(results: any): PollResultMap[T];
  parseVoter(voter: any): PollVoteMap[T];
  buildResults(request: CreatePollRequest<PollType>): PollResultMap[T];
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
