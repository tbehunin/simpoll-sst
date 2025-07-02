import { DbId, dbClient } from "../dbClient";
import { UserEntity } from "./user.entity";

export const UserRepository = {
  batchGet: async (userIds: string[]): Promise<UserEntity[]> => {
    const keys: DbId[] = userIds.map((userId) => ({ pk: `User#${userId}`, sk: 'Profile' }));
    const rawData = await dbClient.batchGet(keys, 'Users');

    if (!rawData) return [];
    return rawData.map(({ pk, sk, username, fullName, email, bio }) => {
      const result: UserEntity = { pk, sk, username, fullName, email, bio };
      return result;
    });
  },
};
