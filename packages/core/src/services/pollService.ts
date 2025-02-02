import { PollType, QueryPollsRequest } from "../common/types";
import { pollDetailsDao } from "../data/pollDetailsDao";
import { pollQueryDao } from "../data/pollQueryDao";
import { PollDetailDoc } from "../data/types";
import { MultipleChoicePoll, Poll, PollBase } from "../models";

const mapToModel = (pollDetailDocs: PollDetailDoc[]): Poll[] => {
  return pollDetailDocs.map((pollDetailDoc) => {
    const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest } = pollDetailDoc;

    const base: PollBase = {
      pollId: pk.split('#')[1],
      userId,
      ct,
      scope,
      type,
      title,
      expireTimestamp,
      votePrivacy,
      sharedWith,
    };
    switch (type) {
      case PollType.MultipleChoice:
        const { multiSelect, choices } = rest;
        const result: MultipleChoicePoll = { ...base, multiSelect, choices };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

export const pollService = {
  queryPolls: async (request: QueryPollsRequest): Promise<string[]> => {
    const result = await pollQueryDao.query(request);
    return result;
  },
  getPollsByIds: async (pollIds: string[]): Promise<Poll[]> => {
    const result = await pollDetailsDao.batchGet(pollIds);
    return mapToModel(result);
  },
};
