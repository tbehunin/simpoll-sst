import { PollType } from "../../common/types";
import { pollResultRepository } from "../../data/poll/result/poll-result.repository";
import { PollResult } from "../../models";
import { PollResultMapper } from "./mappers";

export const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult<PollType>[]> => {
  const entities = await pollResultRepository.batchGet(pollIds);
  return PollResultMapper.toDomainList(entities);
};
