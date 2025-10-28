import React from 'react';
import { useTranslations } from 'next-intl';
import { UpdateUserDto } from '@/domain/entities/User';
import { Button, Input } from '@/components/ui';
import { useUserProfileViewModel } from '../../viewmodels/useUserProfileViewModel';
import { container } from '../../di/container';

type TabKey = 'profile' | 'security' | 'notifications' | 'preferences';

interface Props {
  activeTab: TabKey;
  userId: string;
}

export const SettingsSections: React.FC<Props> = ({ activeTab, userId }) => {
  const t = useTranslations('settings');
  const viewModel = useUserProfileViewModel(container.updateUserProfileUseCase, userId);

  if (activeTab === 'profile') {
    return <ProfileSection t={t} viewModel={viewModel} />;
  }

  if (activeTab === 'security') {
    return <SecuritySection t={t} />;
  }

  if (activeTab === 'notifications') {
    return <NotificationsSection t={t} />;
  }

  return <PreferencesSection t={t} />;
};

const ProfileSection: React.FC<{ t: ReturnType<typeof useTranslations>; viewModel: ReturnType<typeof useUserProfileViewModel> }> = ({ t, viewModel }) => {
  const [formData, setFormData] = React.useState<UpdateUserDto>({
    name: '',
    phone: '',
    address: '',
    gender: 'male',
    birthDate: undefined,
  });

  // sync form with loaded user
  React.useEffect(() => {
    if (viewModel.user) {
      setFormData({
        name: viewModel.user.name || viewModel.user.userName || '',
        phone: viewModel.user.phone || '',
        address: viewModel.user.address || '',
        gender: viewModel.user.gender || 'male',
        birthDate: viewModel.user.birthDate,
      });
    }
  }, [viewModel.user]);

  // safe label helper: tries to get translation, falls back when missing or returns key-like string
  const label = (key: string, fallback: string) => {
    try {
      const v = t(key as never) as string;
      if (!v || typeof v !== 'string' || v.includes('.')) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const handleInputChange = (field: keyof UpdateUserDto, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await viewModel.updateProfile(formData);
      alert(t('profileUpdated') || 'Profile updated');
    } catch {
      alert(t('updateError') || 'Update failed');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={label('name', 'Họ và tên')} value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
        <Input label={label('phone', 'Số điện thoại')} value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />

        <Input label={label('username', 'Tên đăng nhập')} value={viewModel.user?.userName || ''} disabled />

        <Input label={label('email', 'Email')} value={viewModel.user?.email || ''} disabled />
        <Input label={label('birthDate', 'Ngày sinh')} type="date" value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''} onChange={(e) => handleInputChange('birthDate', new Date(e.target.value))} />

        <Input label={label('address', 'Địa chỉ')} className="md:col-span-2" value={formData.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label('gender', 'Giới tính')}</label>
          <select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
            <option value="male">{label('male', 'Nam')}</option>
            <option value="female">{label('female', 'Nữ')}</option>
            <option value="other">{label('other', 'Khác')}</option>
          </select>
        </div>

        {/* backend-only metadata row */}
        <div className="md:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-sm text-gray-600">{label('role', 'Vai trò')}: <span className="font-medium text-gray-800">{viewModel.user?.role || '-'}</span></div>
            <div className="text-sm text-gray-600">{label('verified', 'Đã xác thực')}: <span className={`font-medium ${viewModel.user?.isVerified ? 'text-green-600' : 'text-red-600'}`}>{viewModel.user?.isVerified ? 'Yes' : 'No'}</span></div>
            <div className="text-sm text-gray-600">{label('createdAt', 'Ngày tạo')}: <span className="font-medium text-gray-800">{viewModel.user?.createdAt ? new Date(viewModel.user.createdAt).toLocaleString() : '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary">{label('saveChanges', 'Lưu')}</Button>
        <Button type="button" variant="outline" onClick={() => {
          setFormData({
            name: viewModel.user?.name || '',
            phone: viewModel.user?.phone || '',
            address: viewModel.user?.address || '',
            gender: viewModel.user?.gender || 'male',
            birthDate: viewModel.user?.birthDate,
          });
        }}>{label('cancel', 'Hủy')}</Button>
      </div>
    </form>
  );

};

export default SettingsSections;

// --- Other sections ---
const SecuritySection: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  return (
    <div className="space-y-6 px-2 sm:px-6 py-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('security')}</h2>
        <p className="text-sm text-gray-600">{t('securityDesc')}</p>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <h3 className="font-semibold text-green-800 mb-3">{t('changePasswordTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label={t('currentPassword') || 'Mật khẩu hiện tại'} type="password" />
          <Input label={t('newPassword') || 'Mật khẩu mới'} type="password" />
          <Input label={t('confirmNewPassword') || 'Xác nhận mật khẩu mới'} type="password" />
        </div>
        <div>
          <Button variant="primary">{t('updatePassword')}</Button>
        </div>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800">{t('twoFactorTitle')}</h3>
            <p className="text-sm text-gray-600">{t('twoFactorDesc')}</p>
          </div>
          <ToggleSwitch label="" enabled={false} />
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

const NotificationsSection: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => (
  <div className="px-2 sm:px-6 py-6 space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">{t('notificationsTitle')}</h2>
      <p className="text-sm text-gray-600">{t('notificationsDesc')}</p>
    </div>

    <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
      <ToggleSwitch label={t('notif_order')} description={t('notif_order_desc')} enabled={true} />
      <ToggleSwitch label={t('notif_promo')} description={t('notif_promo_desc')} enabled={true} />
      <ToggleSwitch label={t('notif_new_product')} description={t('notif_new_product_desc')} enabled={false} />
      <ToggleSwitch label={t('notif_livestream')} description={t('notif_livestream_desc')} enabled={true} />
      <ToggleSwitch label={t('notif_community')} description={t('notif_community_desc')} enabled={false} />
    </div>
  </div>
);

const PreferencesSection: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => (
  <div className="px-2 sm:px-6 py-6 space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">{t('preferences')}</h2>
      <p className="text-sm text-gray-600">{t('preferencesDesc')}</p>
    </div>

    <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('pref_language')}</label>
      <select className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4">
        <option value="vi">{t('lang_vietnamese')}</option>
        <option value="en">{t('lang_english')}</option>
      </select>

      <SelectField label={t('pref_timezone')} options={[t('timezone_gmt7') || '(GMT+7)']} />
    </div>

    <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
      <ToggleSwitch label={t('darkMode')} description={t('darkModeDesc')} enabled={false} />
    </div>

    <div className="bg-red-50 p-4 sm:p-6 rounded-2xl border border-red-100">
      <h3 className="font-semibold text-red-600 mb-2">{t('dangerous_zone')}</h3>
      <p className="text-sm text-gray-600 mb-4">{t('dangerous_desc')}</p>
      <Button variant="outline" className="border-red-300 text-red-600">{t('deleteAccount')}</Button>
    </div>
  </div>
);

// --- Reusable small components (local) ---

const SelectField: React.FC<{
  label?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <select value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all duration-200 focus:border-blue-500">
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const ToggleSwitch: React.FC<{
  label: string;
  description?: string;
  enabled: boolean;
}> = ({ label, description, enabled }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex-1">
      <div className="font-medium text-gray-800">{label}</div>
      {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
    </div>
    <button className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? 'transform translate-x-7' : ''}`} />
    </button>
  </div>
);

const DeviceItem: React.FC<{
  name: string;
  location: string;
  time: string;
  isCurrent?: boolean;
  t: ReturnType<typeof useTranslations>;
}> = ({ name, location, time, isCurrent, t }) => (
  <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">💻</div>
      <div>
        <div className="font-semibold text-gray-800">{name} {isCurrent && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{t('current')}</span>}</div>
        <div className="text-sm text-gray-500">{location}</div>
        <div className="text-xs text-gray-400 mt-1">{time}</div>
      </div>
    </div>
    {!isCurrent && <Button variant="outline" size="sm" className="border-red-200 text-red-600">{t('logout')}</Button>}
  </div>
);
