import { builder } from "../builder";
import { Poll } from "../../../../../core/src/models";
import { pollService } from "../../../../../core/src/services/pollService";
import { pollScope, pollType, votePrivacy } from "../common/enums";

const MAX_DATE = '9999-12-31T23:59:59.999Z';

export const poll = builder.loadableInterfaceRef<Poll, string>('Poll', {
  load: (ids) => pollService.getPollsByIds(ids),
}).implement({
  fields: (t) => ({
    pollId: t.exposeID('pollId'),
    userId: t.exposeID('userId'),
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
