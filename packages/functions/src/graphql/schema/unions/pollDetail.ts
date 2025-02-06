import { builder } from '../builder';
import { multipleChoiceDetail } from '../types/multipleChoicePoll';
import { rankDetail } from '../types/rankPoll';

export const pollDetail = builder.unionType('PollDetail', {
  types: [multipleChoiceDetail, rankDetail],
  resolveType: (obj) => `${obj.type}Detail`,
});
