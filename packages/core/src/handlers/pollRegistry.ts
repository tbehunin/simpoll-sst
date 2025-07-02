import { PollDetailsMap, PollResultsMap, PollType, PollVoterMap } from "../common/types";
import { CreatePollRequest } from "../services/types";
import { multipleChoiceHandler } from "./multipleChoiceHandler";



export interface PollTypeHandler<T extends PollType> {
  parseDetails(details: any): PollDetailsMap[T];
  parseResults(results: any): PollResultsMap[T];
  parseVoter(voter: any): PollVoterMap[T];
  parseVoteStream(voteImage: any): PollVoterMap[T];
  buildResults(request: CreatePollRequest<PollType>): PollResultsMap[T];
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
