import { builder } from "../builder";
import { AuthorType, PollScope, PollStatus, VoteStatus } from "../../../../../core/src/models";
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
    voteStatus: t.field({ type: VoteStatus, required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const publicPollsResolver = (_root: any, args: { input?: { voteStatus?: VoteStatus | null, pollStatus?: PollStatus | null } | null }, context: ContextType) => {
  return pollService.queryPolls({
    userId: context.currentUserId,
    authorType: AuthorType.Friend,
    scope: PollScope.Public,
    voteStatus: args.input?.voteStatus,
    pollStatus: args.input?.pollStatus,
  });
};
