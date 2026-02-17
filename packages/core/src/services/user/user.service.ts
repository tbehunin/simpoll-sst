import { UserRepository } from '../../data/user/user.repository';
import { User } from './user.domain';
import { UserMapper } from './user.mapper';

export interface SyncUserProfileRequest {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
}

export const UserService = {
  getUsersByIds: async (userIds: string[]): Promise<User[]> => {
    const result = await UserRepository.batchGet(userIds);
    return result.map(UserMapper.toDomain);
  },

  /**
   * Sync user profile from Cognito to DynamoDB
   * Called by Cognito post-auth trigger on every login
   */
  syncUserProfile: async (request: SyncUserProfileRequest): Promise<void> => {
    const timestamp = new Date().toISOString();

    await UserRepository.upsertUserProfile({
      userId: request.userId,
      username: request.username,
      email: request.email,
      phoneNumber: request.phoneNumber,
      emailVerified: request.emailVerified,
      phoneVerified: request.phoneVerified,
      lastLoginAt: timestamp,
      updatedAt: timestamp,
    });
  },

  /**
   * Get user profile by ID
   */
  getUserProfile: async (userId: string): Promise<User | null> => {
    const entity = await UserRepository.getUserProfile(userId);
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  },
};
