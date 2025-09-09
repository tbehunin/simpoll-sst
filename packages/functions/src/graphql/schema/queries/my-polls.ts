import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { ContextType } from '../../context';

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
  return PollService.queryPollDetails({
      userId: context.currentUserId,
      roleType: RoleType.Author,
      scope: args.input?.pollScope || undefined,
      voted: undefined,
      pollStatus: args.input?.pollStatus || undefined,
    });
};
