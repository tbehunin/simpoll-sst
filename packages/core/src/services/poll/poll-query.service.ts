import { PollType } from "../../common/types";
import { PollDetailRepository } from "../../data/poll/detail/poll-detail.repository";
import { QueryRepository } from "../../data/poll/query/poll-query.repository";
import { Poll } from "../../models";
import { QueryPollsRequest } from "../types";
import { PollDetailMapper } from "./mappers";

export const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await QueryRepository.query(request);
  return result;
};

export const getPollsByIds = async (pollIds: string[]): Promise<Poll<PollType>[]> => {
  const entities = await PollDetailRepository.batchGet(pollIds);
  return PollDetailMapper.toDomainList(entities);
};
