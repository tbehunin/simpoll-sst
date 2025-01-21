import { builder } from "../builder";
import { AuthorType, PollScope, PollStatus, VoteStatus } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { pollService } from "../../../../../core/src/services/pollService";
import { ContextType } from "../../context";

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

export const directPollsResolver = (_root: any, args: { input?: { voteStatus?: VoteStatus | null, pollStatus?: PollStatus | null } | null }, context: ContextType) => {
  return pollService.queryPolls({
    userId: context.currentUserId,
    authorType: AuthorType.Friend,
    scope: PollScope.Private,
    voteStatus: args.input?.voteStatus,
    pollStatus: args.input?.pollStatus,
  });
}
