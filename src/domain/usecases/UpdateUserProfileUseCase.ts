import { IUserRepository, UpdateUserDto } from '../repositories/IUserRepository';
import { User } from '../entities/User';

export class UpdateUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, updates: UpdateUserDto): Promise<User> {
    return await this.userRepository.updateUserProfile(userId, updates);
  }
}