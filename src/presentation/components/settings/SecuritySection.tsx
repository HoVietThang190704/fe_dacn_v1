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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const viewModel = useChangePasswordViewModel(container.changePasswordUseCase);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: t('passwordsNotMatch') });
      return;
    }

    const data: ChangePasswordDto = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };

    try {
      await viewModel.changePassword(data);
      if (viewModel.success) {
        setFeedback({ type: 'success', message: t('passwordUpdated') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else if (viewModel.error) {
        setFeedback({ type: 'error', message: viewModel.error });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : t('updateError');
      setFeedback({ type: 'error', message });
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
            label={t('currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label={t('newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label={t('confirmNewPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
          <Button variant="primary" onClick={handleChangePassword} disabled={viewModel.isLoading}>
            {viewModel.isLoading ? t('processing') : (t('updatePassword') || t('saveChanges'))}
          </Button>
        </div>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800">{t('twoFactorTitle')}</h3>
            <p className="text-sm text-gray-600">{t('twoFactorDesc')}</p>
          </div>
          <ToggleSwitch label={t('twoFactorToggle') || ''} enabled={false} description={undefined} />
        </div>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <h3 className="font-semibold text-green-800 mb-3">{t('devicesTitle')}</h3>
        <div className="space-y-3">
          <DeviceItem name={t('device_chrome_window')} location={t('location_hcm')} time={t('now')} isCurrent t={t} />
          <DeviceItem name={t('device_safari_iphone')} location={t('location_hanoi')} time={t('hoursAgo', { hours: 2 })} t={t} />
        </div>
      </div>
      {feedback && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default SecuritySection;
