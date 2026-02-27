import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { PublishPollRequest } from '@simpoll-sst/core/services/poll/commands/publish-poll/publish-poll.types';
import { builder } from '../builder';
import { poll } from '../types/poll';

export const publishPoll = builder.mutationField('publishPoll', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: publishPollInput }),
    },
    resolve: async (_parent, args, context) => {
      const { pollId } = args.input;

      const request: PublishPollRequest = {
        pollId,
        userId: context.currentUserId,
      };

      return PollService.publishPoll(request);
    },
  })
);

export const publishPollInput = builder.inputType('PublishPollInput', {
  fields: (t) => ({
    pollId: t.string(),
  }),
});
