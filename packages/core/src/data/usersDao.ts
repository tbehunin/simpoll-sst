import { dbClient, DbId } from './dbClient';
import { UserDoc } from './types';

export const usersDao = {
  batchGet: async (userIds: string[]): Promise<UserDoc[]> => {
    const keys: DbId[] = userIds.map((userId) => ({ pk: `User#${userId}`, sk: 'Profile' }));
    const rawData = await dbClient.batchGet(keys, 'Users');

    if (!rawData) return [];
    return rawData.map(({ pk, sk, username, fullName, email, bio }) => {
      const result: UserDoc = { pk, sk, username, fullName, email, bio };
      return result;
    });
  }
};
