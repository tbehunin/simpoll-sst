import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { toConnection } from '../common/connection';

export const publicPollsInput = builder.inputType('PublicPollsInput', {
  fields: (t) => ({
    voted: t.boolean({ required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const publicPolls = builder.queryField('publicPolls', (t) =>
  t.connection({
    type: poll,
    args: {
      input: t.arg({ type: publicPollsInput, required: false }),
    },
    resolve: async (_root, args, context) => {
      const result = await PollService.queryPollDetails({
        userId: context.currentUserId,
        roleType: RoleType.Participant,
        scope: PollScope.Public,
        voted: args.input?.voted ?? undefined,
        pollStatus: args.input?.pollStatus ?? undefined,
        limit: args.first ?? undefined,
        cursor: args.after ?? undefined,
      });
      return toConnection(result);
    },
  })
);
