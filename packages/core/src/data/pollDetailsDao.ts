import { PollType } from '../common/types';
import { dbClient, DbId } from './dbClient';
import { MultipleChoiceDetailDoc, PollDetailDoc, PollDetailDocBase } from './types';

const mapToDoc = (rawData: Record<string, any>[] | undefined): PollDetailDoc[] => {
  if (!rawData) return [];
  return rawData.map(({ pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest }) => {
    const base: PollDetailDocBase = { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy};
    switch (type) {
      case PollType.MultipleChoice:
        const { multiSelect, choices } = rest;
        const result: MultipleChoiceDetailDoc = { ...base, multiSelect, choices };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

export const pollDetailsDao = {
  batchGet: async (pollIds: string[]): Promise<PollDetailDoc[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Details' }));
    const rawData = await dbClient.batchGet(keys, 'PollDetails');
    return mapToDoc(rawData);
  },
};
