import { PollType } from "../../common/types";
import { PollDetailRepository } from "../../data/poll/detail/poll-detail.repository";
import { QueryRepository } from "../../data/poll/query/poll-query.repository";
import { Poll } from "../../models";
import { QueryPollsRequest } from "../types";

export const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await QueryRepository.query(request);
  return result;
};

export const getPollsByIds = async (pollIds: string[]): Promise<Poll<PollType>[]> => {
  const result = await PollDetailRepository.batchGet(pollIds);
  return result.map((pollDetailDoc) => {
    const { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details } = pollDetailDoc;
    const base = { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details };
    return {
      ...base,
      pollId: pk.split('#')[1],
    };
  });
};
