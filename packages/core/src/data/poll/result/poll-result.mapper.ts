import { PollType } from "../../../common/types";
import { getPollTypeHandler } from "../../../handlers/pollRegistry";
import { PollResultEntity, PollResultEntityBase } from "./poll-result.entity";

export const PollResultMapper = {
  toPollResultEntity: (rawData: Record<string, any>[] | undefined): PollResultEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollResultMapper.toPollResultEntityBase(poll),
        results: handler.parseResults(poll.results),
      };
    });
  },
  toPollResultEntityBase: (rawData: Record<string, any>): PollResultEntityBase => {
    const { pk, sk, type, totalVotes } = rawData;
    return { pk, sk, type, totalVotes };
  },
};
