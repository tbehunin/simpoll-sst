import { builder } from "../builder";
import { RankDetail, RankResult } from "../../../../../core/src/models";
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
