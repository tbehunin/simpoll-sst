import { builder } from '../builder';
import { PollDetailWithType, getRegisteredGraphQLPollTypes } from '../poll-types/registry';

// PollDetailWithType is defined in the registry to avoid a circular dependency with
// poll-types/multiple-choice.graphql.ts, which needs it at registration time.
export type { PollDetailWithType };

export const pollDetail = builder.unionType('PollDetail', {
  types: getRegisteredGraphQLPollTypes().map((h) => h.detailRef) as [any, ...any[]],
  resolveType: (obj: PollDetailWithType<any>) => `${obj.type}Detail`,
});
