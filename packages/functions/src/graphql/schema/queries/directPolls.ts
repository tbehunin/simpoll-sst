import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { ContextType } from '../../context';

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
    voted: t.boolean({ required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const directPollsResolver = (_root: any, args: { input?: { voted?: boolean | null, pollStatus?: PollStatus | null } | null }, context: ContextType) => {
  return PollService.queryPolls({
    userId: context.currentUserId,
    roleType: RoleType.Voter,
    scope: PollScope.Private,
    voted: args.input?.voted || undefined,
    pollStatus: args.input?.pollStatus || undefined,
  });
}
