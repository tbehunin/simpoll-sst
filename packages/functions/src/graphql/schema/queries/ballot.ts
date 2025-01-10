import { builder } from "../builder";
import { Poll, PollScope } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { deleteMePolls } from "./publicPolls";

export const ballot = builder.queryField('ballot', (t) =>
  t.field({
    type: [poll],
    args: {
      input: t.arg({ type: ballotInput, required: false }),
    },
    resolve: ballotResolver,
  })
);

export const ballotInput = builder.inputType('BallotInput', {
  fields: (t) => ({
    pollScope: t.field({ type: PollScope, required: false }),
  }),
});

export const ballotResolver = (a: any, b: any, c: any, d: any): Poll[] => {
  return deleteMePolls;
};
