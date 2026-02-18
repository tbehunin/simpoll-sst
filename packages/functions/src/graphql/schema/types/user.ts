import { User } from '@simpoll-sst/core/services/user/user.domain';
import { UserService } from '@simpoll-sst/core/services/user/user.service';
import { builder } from '../builder';

export const user = builder.loadableObjectRef<User, string>('User', {
  load: async (userIds: string[]) => {
    const users = await UserService.getUsersByIds(userIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return userIds.map((userId) => {
      const user = users.find(user => user.userId === userId);
      return user ? user : new Error(`User with id ${userId} not found`);
    });
  },
}).implement({
  fields: (t) => ({
    userId: t.exposeString('userId'),
    username: t.exposeString('username'),
    fullName: t.string({
      nullable: true,
      resolve: (user) => user.fullName ?? null,
    }),
    bio: t.string({
      nullable: true,
      resolve: (user) => user.bio ?? null,
    }),
  }),
});
