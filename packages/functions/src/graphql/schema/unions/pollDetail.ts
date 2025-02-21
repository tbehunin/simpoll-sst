import { builder } from '../builder';
import { multipleChoiceDetail } from '../types/multipleChoicePoll';

export const pollDetail = builder.unionType('PollDetail', {
  types: [multipleChoiceDetail],
  resolveType: (obj) => `${obj.type}Detail`,
});
