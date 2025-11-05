import { User, UpdateUserDto, ChangePasswordDto } from '../entities/User';

export interface IUserRepository {
  getUserProfile(userId: string): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserDto): Promise<User>;
  uploadUserAvatar(file: File): Promise<string>;
  changePassword(data: ChangePasswordDto): Promise<void>;
}

export type { UpdateUserDto, ChangePasswordDto };