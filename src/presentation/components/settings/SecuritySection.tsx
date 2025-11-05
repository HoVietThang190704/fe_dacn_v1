import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';
import { ToggleSwitch, DeviceItem } from './SharedSettingsComponents';
import { useChangePasswordViewModel } from '@/presentation/viewmodels/useChangePasswordViewModel';
import { container } from '@/presentation/di/container';
import { ChangePasswordDto } from '@/domain/entities/User';

const SecuritySection: React.FC = () => {
  const t = useTranslations('settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const viewModel = useChangePasswordViewModel(container.changePasswordUseCase);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    const data: ChangePasswordDto = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };

    await viewModel.changePassword(data);

    if (viewModel.success) {
      alert('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (viewModel.error) {
      alert(viewModel.error);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-6 py-6 max-w-full">
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{t('security')}</h2>
        <p className="text-sm sm:text-base text-gray-600">{t('securityDesc')}</p>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <h3 className="font-semibold text-green-800 mb-3">{t('changePasswordTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label={t('currentPassword') || 'Mật khẩu hiện tại'}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label={t('newPassword') || 'Mật khẩu mới'}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label={t('confirmNewPassword') || 'Xác nhận mật khẩu mới'}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            disabled={viewModel.isLoading}
          >
            {viewModel.isLoading ? 'Đang xử lý...' : (t('updatePassword') || 'Cập nhật mật khẩu')}
          </Button>
        </div>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800">{t('twoFactorTitle')}</h3>
            <p className="text-sm text-gray-600">{t('twoFactorDesc')}</p>
          </div>
          <ToggleSwitch label="" enabled={false} description={undefined} />
        </div>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <h3 className="font-semibold text-green-800 mb-3">{t('devicesTitle')}</h3>
        <div className="space-y-3">
          <DeviceItem name="Chrome trên Windows" location="TP.HCM, Việt Nam" time={t('now') || 'Hiện tại'} isCurrent t={t} />
          <DeviceItem name="Safari trên iPhone" location="Hà Nội, Việt Nam" time={t('hoursAgo', { hours: 2 }) || '2 giờ trước'} t={t} />
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
