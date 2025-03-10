import { PollDetailsMap, PollType } from '@simpoll-sst/core/common/types';
import { builder } from '../builder';
import { multipleChoiceDetail } from '../types/multipleChoicePoll';

export interface PollDetailWithType<T extends PollType> {
  type: T;
  details: PollDetailsMap[T];
};

export const pollDetail = builder.unionType('PollDetail', {
  types: [multipleChoiceDetail],
  resolveType: (obj) => `${obj.type}Detail`,
});
