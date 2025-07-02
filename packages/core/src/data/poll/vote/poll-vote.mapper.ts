import { PollType } from "../../../common/types";
import { getPollTypeHandler } from "../../../handlers/pollRegistry";
import { PollVoteEntity, PollVoteEntityBase } from "./poll-vote.entity";

export const PollVoteMapper = {
  toPollVoteEntity: (rawData: Record<string, any>[] | undefined): PollVoteEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollVoteMapper.toPollVoteEntityBase(poll),
        vote: poll.vote ? handler.parseVoter(poll.vote) : undefined,
      };
    });
  },
  toPollVoteEntityBase: (rawData: Record<string, any>): PollVoteEntityBase => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
    return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
  },
};
