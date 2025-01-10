import { builder } from "../builder";
import { Poll } from "../../../../../core/src/models";
import { votePrivacy } from "../common/enums";
import { poll } from "../interfaces/poll";
import { deleteMePolls } from "../queries/publicPolls";
import { multipleChoiceInput } from "../types/multipleChoicePoll";

export const createPoll = builder.mutationField('createPoll', (t) =>
  t.field({
    type: poll,
    args: {
      input: t.arg({ type: createPollInput }),
    },
    resolve: resolver,
  })
);

export const createPollInput = builder.inputType('CreatePollInput', {
  fields: (t) => ({
    title: t.string(),
    sharedWith: t.stringList(),
    votePrivacy: t.field({ type: votePrivacy }),
    expireTimestamp: t.string({ required: false }),
    multipleChoice: t.field({ type: multipleChoiceInput, required: false }),
  }),
});

 const resolver = async (a: any, b: any, c: any, d: any): Promise<Poll> => {
   return deleteMePolls[0];
 };
 