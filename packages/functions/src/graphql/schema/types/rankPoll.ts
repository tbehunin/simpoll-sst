import { builder } from "../builder";
import { PollType, RankPoll, RankResult } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { pollResult } from "../interfaces/pollResult";

export const rankPoll = builder.objectRef<RankPoll>('RankPoll').implement({
  interfaces: [poll],
  isTypeOf: (obj: any) => obj.type === PollType.Rank,
  fields: (t) => ({
    foo: t.exposeString('foo'),
    results: t.expose('results', { type: rankResult, nullable: true }),
  }),
});

export const rankResult = builder.objectRef<RankResult>('RankResult').implement({
  interfaces: [pollResult],
  fields: (t) => ({
    ranks: t.exposeString('foo'),
  }),
});
