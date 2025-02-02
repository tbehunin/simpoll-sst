import { builder } from "../builder";
import { User } from "../../../../../core/src/models";
import { userService } from "../../../../../core/src/services/userService";

export const user = builder.loadableObjectRef<User, string>('User', {
  load: (ids: string[]) => userService.getUsersByIds(ids),
}).implement({
  fields: (t) => ({
    userId: t.exposeString('userId'),
    username: t.exposeString('username'),
    fullName: t.exposeString('fullName'),
    bio: t.exposeString('bio'),
  }),
});
