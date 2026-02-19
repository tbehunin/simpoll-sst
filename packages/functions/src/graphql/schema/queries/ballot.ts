import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { toConnection } from '../common/connection';

export const ballotInput = builder.inputType('BallotInput', {
  fields: (t) => ({
    pollScope: t.field({ type: PollScope, required: false }),
  }),
});

export const ballot = builder.queryField('ballot', (t) =>
  t.connection({
    type: poll,
    args: {
      input: t.arg({ type: ballotInput, required: false }),
    },
    resolve: async (_root, args, context) => {
      const result = await PollService.queryPollDetails({
        userId: context.currentUserId,
        roleType: RoleType.Participant,
        scope: args.input?.pollScope || undefined,
        voted: false,
        pollStatus: PollStatus.Open,
        limit: args.first ?? undefined,
        cursor: args.after ?? undefined,
      });
      return toConnection(result);
    },
  })
);
