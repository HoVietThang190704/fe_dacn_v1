import { IUserRepository } from '../repositories/IUserRepository';

export class UploadUserAvatarUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(file: File): Promise<string> {
    if (!file) {
      throw new Error('Avatar file is required');
    }

    return this.userRepository.uploadUserAvatar(file);
  }
}
