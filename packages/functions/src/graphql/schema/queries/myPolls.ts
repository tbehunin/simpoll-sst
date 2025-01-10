import { builder } from "../builder";
import { Poll, PollScope, PollStatus } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { deleteMePolls } from "./publicPolls";

export const myPolls = builder.queryField('myPolls', (t) =>
  t.field({
    type: [poll],
    args: {
      input: t.arg({ type: myPollsInput, required: false }),
    },
    resolve: myPollsResolver,
  })
);

export const myPollsInput = builder.inputType('MyPollsInput', {
  fields: (t) => ({
    pollScope: t.field({ type: PollScope, required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const myPollsResolver = (a: any, b: any, c: any, d: any): Poll[] => {
  return deleteMePolls;
};
