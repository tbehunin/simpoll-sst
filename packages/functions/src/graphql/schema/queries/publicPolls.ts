import { builder } from "../builder";
import { RoleType, PollScope, PollStatus } from "../../../../../core/src/common/types";
import { pollService } from "../../../../../core/src/services/pollService";
import { poll } from "../interfaces/poll";
import { ContextType } from "../../context";

export const publicPolls = builder.queryField('publicPolls', (t) =>
  t.field({
    type: [poll],
    args: {
      input: t.arg({ type: publicPollsInput, required: false }),
    },
    resolve: publicPollsResolver,
  })
);

export const publicPollsInput = builder.inputType('PublicPollsInput', {
  fields: (t) => ({
    voted: t.boolean({ required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const publicPollsResolver = (_root: any, args: { input?: { voted?: boolean | null, pollStatus?: PollStatus | null } | null }, context: ContextType) => {
  return pollService.queryPolls({
    userId: context.currentUserId,
    roleType: RoleType.Voter,
    scope: PollScope.Public,
    voted: args.input?.voted || undefined,
    pollStatus: args.input?.pollStatus || undefined,
  });
};
