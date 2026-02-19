import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { toConnection } from '../common/connection';

export const myPollsInput = builder.inputType('MyPollsInput', {
  fields: (t) => ({
    pollScope: t.field({ type: PollScope, required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const myPolls = builder.queryField('myPolls', (t) =>
  t.connection({
    type: poll,
    args: {
      input: t.arg({ type: myPollsInput, required: false }),
    },
    resolve: async (_root, args, context) => {
      const result = await PollService.queryPollDetails({
        userId: context.currentUserId,
        roleType: RoleType.Author,
        scope: args.input?.pollScope || undefined,
        voted: undefined,
        pollStatus: args.input?.pollStatus || undefined,
        limit: args.first ?? undefined,
        cursor: args.after ?? undefined,
      });
      return toConnection(result);
    },
  })
);
