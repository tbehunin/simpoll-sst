import { UserDoc } from "../data/types";
import { usersDao } from "../data/usersDao";
import { User } from "../models";

const mapToModel = (userDocs: UserDoc[]): User[] => {
  return userDocs.map((userDoc) => {
    const { pk, username, fullName, email, bio } = userDoc;
    return { userId: pk.split('#')[1], username, fullName, email, bio };
  });
};

export const userService = {
  getUsersByIds: async (userIds: string[]): Promise<User[]> => {
    const result = await usersDao.batchGet(userIds);
    return mapToModel(result);
  },
};
