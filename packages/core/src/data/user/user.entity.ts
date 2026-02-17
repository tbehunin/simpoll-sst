export type UserEntity = {
  pk: string
  sk: string
  username: string
  fullName?: string
  email: string
  bio?: string
  emailVerified?: boolean
  lastLoginAt?: string
  updatedAt?: string
  createdAt?: string
};
