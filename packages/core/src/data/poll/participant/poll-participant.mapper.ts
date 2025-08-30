import { PollType } from "../../../common/types";
import { getPollTypeHandler } from "../../../handlers/pollRegistry";
import { PollParticipantEntity, PollParticipantEntityBase } from "./poll-participant.entity";

export const PollParticipantMapper = {
  toPollParticipantEntity: (rawData: Record<string, any>[] | undefined): PollParticipantEntity<PollType>[] => {
    if (!rawData) return [];
    return rawData.map((poll) => {
      const handler = getPollTypeHandler(poll.type);
      return {
        ...PollParticipantMapper.toPollParticipantEntityBase(poll),
        vote: poll.vote ? handler.parseParticipant(poll.vote) : undefined,
      };
    });
  },
  toPollParticipantEntityBase: (rawData: Record<string, any>): PollParticipantEntityBase => {
    const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
    return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
  },
  parseStreamImage: (image: Record<string, any>): PollParticipantEntity<PollType> => {
    const handler = getPollTypeHandler(image.type.S as PollType);
    return {
      pk: image.pk.S,
      sk: image.sk.S,
      type: image.type.S as PollType,
      gsipk1: image.gsipk1.S,
      gsipk2: image.gsipk2.S,
      gsisk1: image.gsisk1.S,
      gsisk2: image.gsisk2.S,
      voteTimestamp: image.voteTimestamp.S,
      vote: handler.parseVoteStream(image.vote),
    };
  },
};
