import { PollDetailDocBase, PollResultDocBase, PollVoterDocBase } from "../data/types";

const mapToPollDetailDocBase = (rawData: Record<string, any>): PollDetailDocBase => {
  const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy } = rawData;
  return { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy};
};
const mapToPollResultDocBase = (rawData: Record<string, any>): PollResultDocBase => {
  const { pk, sk, type, totalVotes } = rawData;
  return { pk, sk, type, totalVotes };
};
const mapToPollVoterDocBase = (rawData: Record<string, any>): PollVoterDocBase => {
  const { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp } = rawData;
  return { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
};

export const commonMapper = {
  mapToPollDetailDocBase,
  mapToPollResultDocBase,
  mapToPollVoterDocBase,
};
