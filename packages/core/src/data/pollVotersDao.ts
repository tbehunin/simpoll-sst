import { PollType } from "../common/types";
import { PollDetailDoc, PollDetailDocBase } from "./types";

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollDetailDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest }) => {
    const base: PollDetailDocBase = { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy};
    switch (type) {
      case PollType.MultipleChoice:
        const { multiSelect, choices } = rest;
        return { ...base, multiSelect, choices };
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

export const pollVotersDao = {
  // todo
};
