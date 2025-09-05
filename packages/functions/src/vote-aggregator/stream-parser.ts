import { PollParticipant, PollParticipantMapper } from "@simpoll-sst/core/services/poll/participants";
import { parsePollType, PollType } from "@simpoll-sst/core/common/types";
import { getPollTypeHandler } from "@simpoll-sst/core/handlers/pollRegistry";
import { DynamoDBRecord } from "aws-lambda";
import { PollParticipantEntity } from "@simpoll-sst/core/common/poll-participant.entity";

export const parsePollParticipant = (record: DynamoDBRecord): PollParticipant<PollType> | null => {
  const image = record?.dynamodb?.NewImage || {};
  const entity = parsePollParticipantImage(image);
  return PollParticipantMapper.toDomain(entity);
};

const parsePollParticipantImage = (image: Record<string, any>): PollParticipantEntity<PollType> => {
  const type = parsePollType(image.type?.S);
  const handler = getPollTypeHandler(type);
  return {
    pk: image.pk.S,
    sk: image.sk.S,
    type: type,
    gsipk1: image.gsipk1.S,
    gsipk2: image.gsipk2.S,
    gsisk1: image.gsisk1.S,
    gsisk2: image.gsisk2.S,
    voteTimestamp: image.voteTimestamp.S,
    vote: handler.parseVoteStream(image.vote),
  };
};
