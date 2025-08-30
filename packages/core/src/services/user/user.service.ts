import { UserRepository } from '../../data/user/user.repository';
import { User } from './user.domain';
import { UserMapper } from './user.mapper';

export const UserService = {
  getUsersByIds: async (userIds: string[]): Promise<User[]> => {
    const result = await UserRepository.batchGet(userIds);
    return result.map(UserMapper.toDomain);
  },
};
