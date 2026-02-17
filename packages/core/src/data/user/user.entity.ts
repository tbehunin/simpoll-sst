export type UserEntity = {
  pk: string
  sk: string
  username: string
  fullName?: string
  email: string
  phoneNumber?: string
  bio?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  lastLoginAt?: string
  updatedAt?: string
  createdAt?: string
};
