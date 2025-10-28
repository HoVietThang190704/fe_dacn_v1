import { User, UpdateUserDto } from '../entities/User';

export interface IUserRepository {
  getUserProfile(userId: string): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserDto): Promise<User>;
}

export type { UpdateUserDto };