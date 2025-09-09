import { RoleType, PollScope, PollStatus } from '@simpoll-sst/core/common/poll.types';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { builder } from '../builder';
import { poll } from '../types/poll';
import { ContextType } from '../../context';

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
  return PollService.queryPollDetails({
    userId: context.currentUserId,
    roleType: RoleType.Participant,
    scope: args.input?.pollScope || undefined,
    voted: false,
    pollStatus: PollStatus.Open,
  });
};
