import { builder } from "../builder";
import { AuthorType, PollScope, PollStatus, VoteStatus } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";
import { ContextType } from "../../context";
import { pollService } from "../../../../../core/src/services/pollService";

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

export const ballotResolver = (_root: any, args: { input?: { pollScope?: PollScope | null } | null }, context: ContextType) => {
  return pollService.queryPolls({
    userId: context.currentUserId,
    authorType: AuthorType.Friend,
    scope: args.input?.pollScope,
    voteStatus: VoteStatus.Unvoted,
    pollStatus: PollStatus.Open,
  });
};
