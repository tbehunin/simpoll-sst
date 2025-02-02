import { builder } from "../builder";
import { User } from "../../../../../core/src/models";

export const user = builder.objectRef<User>('User').implement({
  fields: (t) => ({
    userId: t.exposeString('userId'),
    username: t.exposeString('username'),
    fullName: t.exposeString('fullName'),
    bio: t.exposeString('bio'),
  }),
});
