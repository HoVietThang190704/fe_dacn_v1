import { IUserRepository, UpdateUserDto } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserApiDataSource } from '../datasources/UserApiDataSource';

export class UserRepositoryImpl implements IUserRepository {
  constructor(private apiDataSource: UserApiDataSource) {}

  async getUserProfile(userId: string): Promise<User> {
    return await this.apiDataSource.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, updates: UpdateUserDto): Promise<User> {
    return await this.apiDataSource.updateUserProfile(userId, updates);
  }
}