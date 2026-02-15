import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { ContextType } from '../../context';

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
  return PollService.queryPollDetails({
    userId: context.currentUserId,
    roleType: RoleType.Participant,
    scope: PollScope.Public,
    voted: args.input?.voted ?? undefined,
    pollStatus: args.input?.pollStatus ?? undefined,
  });
};
