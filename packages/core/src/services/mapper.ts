import { PollScope, PollType } from "../common/types";
import { PollDetailDoc, PollResultDoc, PollVoterDoc } from "../data/types";
import { MultipleChoiceDetail, MultipleChoiceResult, Poll, PollDetail, PollResult, PollVoter } from "../models";

const mapToPoll = (pollDetailDoc: PollDetailDoc): Poll => {
  const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest } = pollDetailDoc;
  
  function mapDetails(): PollDetail {
    switch (type) {
      case PollType.MultipleChoice:
        const { multiSelect, choices } = rest;
        const result: MultipleChoiceDetail = { type, multiSelect, choices };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  }

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
    details: mapDetails(),
  };
  return poll;
};

const mapToPollResult = (pollResultDoc: PollResultDoc): PollResult => {
  const { pk, sk, type, totalVotes, ...rest } = pollResultDoc;
  const base = { pk, sk, type, totalVotes };
  switch (type) {
    case PollType.MultipleChoice:
      const { choices } = rest;
      const result: MultipleChoiceResult = {
        pollId: pk.split('#')[1],
        type,
        totalVotes,
        choices
      };
      return result;
  }
  throw new Error(`Unknown poll type: ${type}`);
};

const mapToPollVoter = (pollVoterDoc: PollVoterDoc) => {
  const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, ...rest } = pollVoterDoc;
  const base = { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
  switch (type) {
    case PollType.MultipleChoice:
      const { selectedIndex } = rest;
      const result: PollVoter = {
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
  }
  throw new Error(`Unknown poll type: ${type}`);
};

export const mapper = {
  mapToPoll,
  mapToPollResult,
  mapToPollVoter,
};
