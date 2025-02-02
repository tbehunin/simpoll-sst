import { builder } from "../builder";
import { RoleType, PollScope, PollStatus } from "../../../../../core/src/common/types";
import { poll } from "../interfaces/poll";
import { ContextType } from "../../context";
import { pollService } from "../../../../../core/src/services/pollService";

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

export const myPollsResolver = (_root: any, args: { input?: { pollScope?: PollScope | null, pollStatus?: PollStatus | null } | null }, context: ContextType) => {
  return pollService.queryPolls({
      userId: context.currentUserId,
      roleType: RoleType.Author,
      scope: args.input?.pollScope || undefined,
      voted: undefined,
      pollStatus: args.input?.pollStatus || undefined,
    });
};
