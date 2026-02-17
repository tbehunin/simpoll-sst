import { DbId, dbClient } from '../db.client';
import { UserEntity } from './user.entity';

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

  /**
   * Upsert user profile (create or update)
   * Used by Cognito post-auth trigger to sync user data
   */
  upsertUserProfile: async (data: {
    userId: string;
    username: string;
    email: string;
    emailVerified: boolean;
    lastLoginAt: string;
    updatedAt: string;
  }): Promise<void> => {
    const item: UserEntity = {
      pk: `User#${data.userId}`,
      sk: 'Profile',
      username: data.username,
      email: data.email,
      emailVerified: data.emailVerified,
      lastLoginAt: data.lastLoginAt,
      updatedAt: data.updatedAt,
    };

    await dbClient.put(item);
  },

  /**
   * Get user profile by userId
   */
  getUserProfile: async (userId: string): Promise<UserEntity | undefined> => {
    const result = await dbClient.get(
      { pk: `User#${userId}`, sk: 'Profile' },
      'Get User Profile'
    );
    return result as UserEntity | undefined;
  },
};
