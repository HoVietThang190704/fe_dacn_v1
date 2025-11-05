import { useState } from 'react';
import { ChangePasswordUseCase } from '@/domain/usecases/user/ChangePasswordUseCase';
import { ChangePasswordDto } from '@/domain/entities/User';

export interface UseChangePasswordViewModel {
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const useChangePasswordViewModel = (
  changePasswordUseCase: ChangePasswordUseCase
): UseChangePasswordViewModel => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await changePasswordUseCase.execute(data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
    error,
    success,
  };
};