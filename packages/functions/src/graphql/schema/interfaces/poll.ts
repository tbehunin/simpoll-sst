import { builder } from "../builder";
import { Poll } from "../../../../../core/src/models";
import { pollService } from "../../../../../core/src/services/pollService";
import { pollScope, pollType, votePrivacy } from "../common/enums";
import { MAX_DATE } from "../../../../../core/src/common/constants";
import { user } from "../types/user";

export const poll = builder.loadableInterfaceRef<Poll, string>('Poll', {
  load: async (pollIds: string[]) => {
    const polls = await pollService.getPollsByIds(pollIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollIds.map((pollId) => {
      const poll = polls.find(poll => poll.pollId === pollId);
      return poll ? poll : new Error(`Poll with id ${pollId} not found`);
    });
  },
}).implement({
  fields: (t) => ({
    pollId: t.exposeID('pollId'),
    userId: t.exposeID('userId'),
    user: t.field({
      type: user,
      resolve: (parent) => parent.userId,
    }),
    ct: t.exposeString('ct'),
    scope: t.expose('scope', { type: pollScope }),
    type: t.expose('type', { type: pollType }),
    title: t.exposeString('title'),
    expireTimestamp: t.field({
      type: 'String',
      nullable: true,
      resolve: (parent) => parent.expireTimestamp === MAX_DATE ? null : parent.expireTimestamp,
    }),
    votePrivacy: t.expose('votePrivacy', { type: votePrivacy }),
    sharedWith: t.exposeStringList('sharedWith'),
  }),
});
