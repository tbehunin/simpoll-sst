import { PollType } from "../common/types";
import { dbClient, DbId } from "./dbClient";
import { MultipleChoiceResultDoc, PollResultDoc, PollResultDocBase } from "./types";

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollResultDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ pk, sk, type, totalVotes, ...rest }) => {
    const base: PollResultDocBase = { pk, sk, type, totalVotes };
    switch (type) {
      case PollType.MultipleChoice:
        const { choices } = rest;
        const result: MultipleChoiceResultDoc = { ...base, choices };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

export const pollResultsDao = {
  batchGet: async (pollIds: string[]): Promise<PollResultDoc[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');
    return mapToDoc(rawData);
  }
};
