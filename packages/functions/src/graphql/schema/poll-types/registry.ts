import { PollDetailMap, PollType } from '@simpoll-sst/core/common';

/**
 * Re-exported here (rather than in unions/poll-detail.ts) so that multiple-choice.graphql.ts
 * can import it without creating a circular dependency with the unions layer.
 */
export interface PollDetailWithType<T extends PollType> {
  type: T;
  details: PollDetailMap[T];
}

// A Pothos object/input ref is any object with a `name` string — used as the structural
// minimum required by builder.unionType({ types: [...] }) and builder.inputType field references.
// We avoid importing ObjectRef / InputObjectRef directly because their generic arity varies
// across Pothos versions. The cast to `[any, ...any[]]` at the union usage site is sufficient.
type AnyRef = { name: string };

/**
 * The GraphQL-layer counterpart to PollTypeHandler in core. Each poll type registers
 * one of these so that unions and mutation inputs are assembled dynamically.
 */
export interface PollTypeGraphQLHandler<T extends PollType> {
  /** The input field name used in CreatePollInput / VoteInput (e.g. 'multipleChoice') */
  fieldName: string;

  // Output object refs — added to the three union types
  detailRef: AnyRef;
  resultRef: AnyRef;
  participantRef: AnyRef;

  // Input object refs — added as optional fields to CreatePollInput / VoteInput
  detailInput: AnyRef;
  voteInput: AnyRef;
}

const graphqlPollRegistry = new Map<PollType, PollTypeGraphQLHandler<PollType>>();

export const registerGraphQLPollType = <T extends PollType>(
  type: T,
  handler: PollTypeGraphQLHandler<T>
): void => {
  graphqlPollRegistry.set(type, handler as PollTypeGraphQLHandler<PollType>);
};

export const getGraphQLPollTypeHandler = (type: PollType): PollTypeGraphQLHandler<PollType> => {
  const handler = graphqlPollRegistry.get(type);
  if (!handler) throw new Error(`No GraphQL handler registered for poll type: ${type}`);
  return handler;
};

/** Returns all registered handlers in insertion order. */
export const getRegisteredGraphQLPollTypes = (): PollTypeGraphQLHandler<PollType>[] => {
  return Array.from(graphqlPollRegistry.values());
};
