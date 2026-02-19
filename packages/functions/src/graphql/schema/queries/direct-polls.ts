import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { toConnection } from '../common/connection';

export const directPollsInput = builder.inputType('DirectPollsInput', {
  fields: (t) => ({
    voted: t.boolean({ required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const directPolls = builder.queryField('directPolls', (t) =>
  t.connection({
    type: poll,
    args: {
      input: t.arg({ type: directPollsInput, required: false }),
    },
    resolve: async (_root, args, context) => {
      const result = await PollService.queryPollDetails({
        userId: context.currentUserId,
        roleType: RoleType.Participant,
        scope: PollScope.Private,
        voted: args.input?.voted ?? undefined,
        pollStatus: args.input?.pollStatus ?? undefined,
        limit: args.first ?? undefined,
        cursor: args.after ?? undefined,
      });
      return toConnection(result);
    },
  })
);
