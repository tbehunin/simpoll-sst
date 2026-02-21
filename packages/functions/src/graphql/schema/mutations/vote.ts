import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { PollType } from '@simpoll-sst/core/common';
import { getPollTypeHandler } from '@simpoll-sst/core/poll-types';
import { VoteRequest } from '@simpoll-sst/core/services/poll/commands/vote/vote.types';
import { builder } from '../builder';
import { pollType } from '../common/enums';
import { poll } from '../types/poll';
import { getRegisteredGraphQLPollTypes, getGraphQLPollTypeHandler } from '../poll-types/registry';

export const vote = builder.mutationField('vote', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: voteInput }),
    },
    resolve: async (_parent, args, context) => {
      // Use `any` cast since poll-type-specific fields are dynamic and not in the static TS type.
      const input = args.input as any;
      const { pollId, type } = input;

      const coreHandler = getPollTypeHandler(type);
      const gqlHandler = getGraphQLPollTypeHandler(type);

      // Route to the correct vote input field for this poll type, then parse.
      // This fixes the latent bug where the old code always read `multipleChoice`
      // regardless of the `type` field, silently passing undefined for any other type.
      const rawVote = input[gqlHandler.fieldName];

      const request: VoteRequest<PollType> = {
        pollId,
        userId: context.currentUserId,
        type,
        vote: coreHandler.parseParticipant(rawVote),
      };

      await PollService.vote(request);

      return pollId;
    },
  })
);

export const voteInput = builder.inputType('VoteInput', {
  // Dynamic poll-type vote fields are spread in at schema-build time from the registry.
  fields: (t): any => ({
    pollId: t.string(),
    type: t.field({ type: pollType }),
    // One optional field per registered poll type (e.g. multipleChoice, rating, …):
    ...Object.fromEntries(
      getRegisteredGraphQLPollTypes().map((h) => [
        h.fieldName,
        t.field({ type: h.voteInput, required: false }),
      ])
    ),
  }),
});
