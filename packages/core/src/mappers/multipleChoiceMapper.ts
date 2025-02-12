import { PollScope } from "../common/types";
import { MultipleChoiceDetailDoc, MultipleChoiceResultDoc, MultipleChoiceVoterDoc, PollDetailDocBase, PollResultDocBase, PollVoterDocBase } from "../data/types";
import { MultipleChoiceResult, Poll } from "../models";
import { commonMapper } from "./commonMapper";
import { PollTypeMapper } from "./pollTypeMapper";

export const multipleChoiceMapper: PollTypeMapper = {
  mapToPollDetailDoc: (rawData: Record<string, any>): MultipleChoiceDetailDoc => {
    const { multiSelect, choices } = rawData;
    return { ...commonMapper.mapToPollDetailDocBase(rawData), multiSelect, choices };
  },
  mapToPollResultDoc: (rawData: Record<string, any>): MultipleChoiceResultDoc => {
    const { choices } = rawData;
    return { ...commonMapper.mapToPollResultDocBase(rawData), choices };
  },
  mapToPollVoterDoc: (rawData: Record<string, any>): MultipleChoiceVoterDoc => {
    const { selectedIndex } = rawData;
    return { ...commonMapper.mapToPollVoterDocBase(rawData), selectedIndex };
  },
  mapToPoll: (pollDetailDoc: MultipleChoiceDetailDoc) => {
    const { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, multiSelect, choices } = pollDetailDoc;
    const poll: Poll = {
      pollId: pk.split('#')[1],
      userId,
      ct,
      scope,
      type,
      title,
      expireTimestamp,
      votePrivacy,
      sharedWith,
      details: {
        type,
        multiSelect,
        choices: choices.map((c) => ({ text: c.text })),
      },
    };
    return poll;
  },
  mapToPollResult: (doc: MultipleChoiceResultDoc) => {
    const { pk, type, totalVotes, choices } = doc;
    const result: MultipleChoiceResult = {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      choices
    };
    return result;
  },
  mapToPollVoter: (pollVoterDoc: MultipleChoiceVoterDoc) => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, selectedIndex } = pollVoterDoc;
    const result = {
      pollId: pk.split('#')[1],
      userId: sk.split('#')[1],
      type,
      pollScope: gsipk1.split('#')[3] === 'Public' ? PollScope.Public : PollScope.Private,
      voted: gsisk1.split('#')[1] === 'Y',
      expireTimestamp: gsisk1.split('#')[2],
      selectedIndex,
      voteTimestamp,
    };
    return result;
  },
};
