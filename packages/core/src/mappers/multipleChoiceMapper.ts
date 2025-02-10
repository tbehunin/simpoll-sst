import { PollScope } from "../common/types";
import { MultipleChoiceDetailDoc, MultipleChoiceResultDoc, MultipleChoiceVoterDoc, PollDetailDocBase, PollResultDocBase, PollVoterDocBase } from "../data/types";
import { MultipleChoiceResult, Poll } from "../models";
import { PollTypeMapper } from "./pollTypeMapper";

export const multipleChoiceMapper: PollTypeMapper = {
  mapToPollDetailDoc: (rawData: Record<string, any>) => {
    const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest } = rawData;
    const base: PollDetailDocBase = { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy};
    const { multiSelect, choices } = rest;
    const result: MultipleChoiceDetailDoc = { ...base, multiSelect, choices };
    return result;
  },
  mapToPollResultDoc: (rawData: Record<string, any>) => {
    const { pk, sk, type, totalVotes, ...rest } = rawData;
    const base: PollResultDocBase = { pk, sk, type, totalVotes };
    const { choices } = rest;
    const result: MultipleChoiceResultDoc = { ...base, choices };
    return result;
  },
  mapToPollVoterDoc: (rawData: Record<string, any>) => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, ...rest } = rawData;
    const base: PollVoterDocBase = { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
    const { selectedIndex } = rest;
    return { ...base, selectedIndex };
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
