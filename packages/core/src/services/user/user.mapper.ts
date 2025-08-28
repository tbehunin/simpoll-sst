import { UserEntity } from "../../data/user/user.entity";
import { User } from "./user.domain";

export const UserMapper = {
  toDomain: (userEntity: UserEntity): User => ({
    userId: userEntity.pk.split('#')[1],
    username: userEntity.username,
    fullName: userEntity.fullName,
    email: userEntity.email,
    bio: userEntity.bio,
  }),
};
