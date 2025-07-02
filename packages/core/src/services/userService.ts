import { UserEntity } from '../data/user/user.entity';
import { UserRepository } from '../data/user/user.repository';
import { User } from '../models';

const mapToModel = (userDocs: UserEntity[]): User[] => {
  return userDocs.map((userDoc) => {
    const { pk, username, fullName, email, bio } = userDoc;
    return { userId: pk.split('#')[1], username, fullName, email, bio };
  });
};

export const userService = {
  getUsersByIds: async (userIds: string[]): Promise<User[]> => {
    const result = await UserRepository.batchGet(userIds);
    return mapToModel(result);
  },
};
