import { builder } from "../builder";
import { pollType, votePrivacy } from "../common/enums";
import { poll } from "../types/poll";
import { multipleChoiceInput } from "../types/multipleChoicePoll";
import { pollService } from "@simpoll-sst/core/services/pollService";
import { CreatePoll } from "@simpoll-sst/core/services/types";
import { PollScope, PollType, VotePrivacy } from "@simpoll-sst/core/common/types";
import { PollDetail } from "@simpoll-sst/core/models";
import { generatePollScope } from "@simpoll-sst/core/services/utils";

export const createPoll = builder.mutationField('createPoll', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: createPollInput }),
    },
    resolve: async (_parent, { input: { type, title, sharedWith, votePrivacy, expireTimestamp, multipleChoice } }, context) => {
      let details: PollDetail;
      switch (type) {
        case PollType.MultipleChoice:
          if (!multipleChoice) {
            throw new Error('Multiple choice poll requires details');
          }
          if (multipleChoice.choices.length < 2) {
            throw new Error('Multiple choice poll requires at least 2 choices');
          }
          details = {
            type,
            multiSelect: multipleChoice.multiSelect,
            choices: multipleChoice.choices.map((text) => ({ text })),
          };
          break;
        default:
          throw new Error(`Unknown poll type: ${type}`);
      }
      const request: CreatePoll = {
        userId: context.currentUserId,
        type,
        title,
        expireTimestamp: expireTimestamp || undefined,
        sharedWith,
        votePrivacy: generatePollScope(sharedWith) === PollScope.Public ? VotePrivacy.Anonymous : votePrivacy,
        details,
      };
      return pollService.createPoll(request);
    },
  })
);

export const createPollInput = builder.inputType('CreatePollInput', {
  fields: (t) => ({
    type: t.field({ type: pollType }),
    title: t.string(),
    sharedWith: t.stringList(),
    votePrivacy: t.field({ type: votePrivacy }),
    expireTimestamp: t.string({ required: false }),
    multipleChoice: t.field({ type: multipleChoiceInput, required: false }),
  }),
});
