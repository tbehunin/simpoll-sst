import { PollType } from "../../common/types";
import { PollDetailDoc, PollResultDoc, PollVoterDoc } from "../../data/types";
import { Poll, PollResult, PollVoter } from "../../models";
import { multipleChoiceMapper } from "./multipleChoiceMapper";

export interface PollTypeMapper {
  mapToPoll: (pollDetailDoc: PollDetailDoc) => Poll;
  mapToPollResult: (pollResultDoc: PollResultDoc) => PollResult;
  mapToPollVoter: (pollVoterDoc: PollVoterDoc) => PollVoter;
};

export const pollTypeMapper = {
  get: (type: PollType): PollTypeMapper => {
    switch (type) {
      case PollType.MultipleChoice:
        return multipleChoiceMapper;
    }
    throw new Error(`Unknown poll type: ${type}`);
  },
};
