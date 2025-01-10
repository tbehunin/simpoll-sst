import { builder } from "../builder";
import { Poll, PollStatus, VoteStatus } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { deleteMePolls } from "./publicPolls";

export const directPolls = builder.queryField('directPolls', (t) =>
  t.field({
    type: [poll],
    args: {
      input: t.arg({ type: directPollsInput, required: false }),
    },
    resolve: directPollsResolver,
  })
);

export const directPollsInput = builder.inputType('DirectPollsInput', {
  fields: (t) => ({
    voteStatus: t.field({ type: VoteStatus, required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const directPollsResolver = (a: any, b: any, c: any, d: any): Poll[] => {
  return deleteMePolls;
};
