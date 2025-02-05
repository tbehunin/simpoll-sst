import { builder } from "../builder";
import { RankDetail, RankResult, RankVoter } from "../../../../../core/src/models";
import { pollType } from "../common/enums";

export const rankDetail = builder.objectRef<RankDetail>('RankDetail').implement({
  fields: (t) => ({
    type: t.expose('type', { type: pollType }),
    foo: t.exposeString('foo'),
  }),
});

export const rankResult = builder.objectRef<RankResult>('RankResult').implement({
  fields: (t) => ({
    ranks: t.exposeString('foo'),
  }),
});

export const rankVoter = builder.objectRef<RankVoter>('RankVoter').implement({
  fields: (t) => ({
    voteTimestamp: t.exposeString('voteTimestamp', { nullable: true }),
  }),
});
