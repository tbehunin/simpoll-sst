import { PollType } from "../common/types";
import { PollDetailDoc, PollResultDoc, PollVoterDoc } from "../data/types";
import { Poll, PollResult, PollVoter } from "../models";
import { CreatePollRequest, VoteRequest } from "../services/types";
import { multipleChoiceMapper } from "./multipleChoiceMapper";

export interface PollTypeMapper<Detail, Result, Voter> {
  mapToPollDetailDoc: (rawData: Record<string, any>) => PollDetailDoc<Detail>;
  mapToPollResultDoc: (rawData: Record<string, any>) => PollResultDoc<Result>;
  mapToPollVoterDoc: (rawData: Record<string, any>) => PollVoterDoc<Voter>;
  mapToPoll: (pollDetailDoc: PollDetailDoc<Detail>) => Poll<Detail>;
  mapToPollResult: (pollResultDoc: PollResultDoc<Result>) => PollResult<Result>;
  mapToPollVoter: (pollVoterDoc: PollVoterDoc<Voter>) => PollVoter<Voter>;
  validateVoteRequest: (poll: Poll<Detail>, votRequest: VoteRequest<Voter>) => void;
  parseDetails: (request: CreatePollRequest<Detail>) => Detail;
  buildResults: (request: CreatePollRequest<Detail>) => Result;
  parseVote: (request: VoteRequest<Voter>) => Voter;
};

export const pollTypeMapper = {
  get: <Detail, Result, Voter>(type: PollType): PollTypeMapper<Detail, Result, Voter> => {
    switch (type) {
      case PollType.MultipleChoice:
        return multipleChoiceMapper as unknown as PollTypeMapper<Detail, Result, Voter>;
    }
    throw new Error(`Unknown poll type: ${type}`);
  },
};
