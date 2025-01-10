import { builder } from "../builder";
import { PollResultBase } from "../../../../../core/src/models";

export const pollResult = builder.interfaceRef<PollResultBase>('PollResult').implement({
  fields: (t) => ({
    totalVotes: t.exposeFloat('totalVotes'),
  }),
});
