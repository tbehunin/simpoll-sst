import { PollType } from "../../common/types";
import { pollResultRepository } from "../../data/poll/result/poll-result.repository";
import { PollResult } from "../../models";

export const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult<PollType>[]> => {
  const result = await pollResultRepository.batchGet(pollIds);
  return result.map((pollResultDoc) => {
    const { pk, type, totalVotes, results } = pollResultDoc;
    return {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      results
    };
  });
};
