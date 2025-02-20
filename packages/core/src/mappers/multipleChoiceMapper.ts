import { MediaAsset, PollDetailBase, PollScope } from "../common/types";
import { PollDetailDoc, PollResultDoc, PollVoterDoc } from "../data/types";
import { Poll, PollResult } from "../models";
import { CreatePollRequest, VoteRequest } from "../services/types";
import { commonMapper } from "./commonMapper";
import { PollTypeMapper } from "./pollTypeMapper";

// data types
// export type MultipleChoiceDetailDoc = {
//   multiSelect: boolean
//   choices: { text: string }[]
// };

// models
export type Choice = {
  text: string
  media?: MediaAsset
};
export type MultipleChoiceDetail = PollDetailBase & {
  multiSelect: boolean
  choices: Choice[]
};
export interface ChoiceResult {
  votes: number
  users: string[]
};
export type MultipleChoiceResult = {
  choices: ChoiceResult[]
};
export type MultipleChoiceVoter = {
  selectedIndex?: number[]
};

export const multipleChoiceMapper: PollTypeMapper<MultipleChoiceDetail, MultipleChoiceResult, MultipleChoiceVoter> = {
  mapToPollDetailDoc: (rawData: Record<string, any>): PollDetailDoc<MultipleChoiceDetail> => {
    const { multiSelect, choices } = rawData;
    const base = commonMapper.mapToPollDetailDocBase(rawData);
    return { ...base, details: { type: base.type, multiSelect, choices } };
  },
  mapToPollResultDoc: (rawData: Record<string, any>): PollResultDoc<MultipleChoiceResult> => {
    const { choices } = rawData;
    return { ...commonMapper.mapToPollResultDocBase(rawData), results: choices };
  },
  mapToPollVoterDoc: (rawData: Record<string, any>): PollVoterDoc<MultipleChoiceVoter> => {
    const { selectedIndex } = rawData;
    return { ...commonMapper.mapToPollVoterDocBase(rawData), vote: selectedIndex };
  },
  mapToPoll: (pollDetailDoc: PollDetailDoc<MultipleChoiceDetail>) => {
    const { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details } = pollDetailDoc;
    const poll: Poll<MultipleChoiceDetail> = {
      pollId: pk.split('#')[1],
      userId,
      ct,
      scope,
      type,
      title,
      expireTimestamp,
      votePrivacy,
      sharedWith,
      details,
    };
    return poll;
  },
  mapToPollResult: (doc: PollResultDoc<MultipleChoiceResult>) => {
    const { pk, type, totalVotes, results } = doc;
    const result: PollResult<MultipleChoiceResult> = {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      results,
    };
    return result;
  },
  mapToPollVoter: (pollVoterDoc: PollVoterDoc<MultipleChoiceVoter>) => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, vote } = pollVoterDoc;
    const result = {
      pollId: pk.split('#')[1],
      userId: sk.split('#')[1],
      type,
      pollScope: gsipk1.split('#')[3] === 'Public' ? PollScope.Public : PollScope.Private,
      voted: gsisk1.split('#')[1] === 'Y',
      expireTimestamp: gsisk1.split('#')[2],
      vote,
      voteTimestamp,
    };
    return result;
  },
  validateVoteRequest: (poll: Poll<MultipleChoiceDetail>, votRequest: VoteRequest<MultipleChoiceVoter>): void => {
    if (!poll.details.multiSelect && votRequest.vote.selectedIndex?.length !== 1) {
      throw new Error('Multiple choice poll is not multi-select');
    }
  },
  parseDetails: (request: CreatePollRequest<MultipleChoiceDetail>): MultipleChoiceDetail => {
    throw new Error("Function not implemented.");
  },
  buildResults: (request: CreatePollRequest<MultipleChoiceDetail>): MultipleChoiceResult => {
    throw new Error("Function not implemented.");
  },
  parseVote: (request: VoteRequest<MultipleChoiceVoter>): MultipleChoiceVoter => {
    throw new Error("Function not implemented.");
  }
};
