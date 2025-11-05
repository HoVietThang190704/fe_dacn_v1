import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../entities/User';

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    if (!userId) {
      throw new Error('User ID is required to fetch profile');
    }
    return this.userRepository.getUserProfile(userId);
  }
}
