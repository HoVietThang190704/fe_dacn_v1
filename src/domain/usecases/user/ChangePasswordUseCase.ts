import { IUserRepository, ChangePasswordDto } from '../../repositories/IUserRepository';

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: ChangePasswordDto): Promise<void> {
    if (!data.oldPassword || data.oldPassword.trim().length === 0) {
      throw new Error('Mật khẩu cũ không được để trống');
    }

    if (!data.newPassword || data.newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (data.oldPassword === data.newPassword) {
      throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
    }
    await this.userRepository.changePassword(data);
  }
}