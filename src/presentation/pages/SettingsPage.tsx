/**
 * Presentation Layer: Settings Page
 * Pure UI component for user settings
 */
'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface SettingsPageProps {
  userId: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ userId }) => {
  const t = useTranslations('settings');
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header - Shopee style */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Sidebar - Responsive */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm p-2 space-y-1">
            <TabButton icon="👤" label={t('profile')} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <TabButton icon="🔒" label={t('security')} active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            <TabButton icon="🔔" label={t('notifications')} active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
            <TabButton icon="⚙️" label={t('preferences')} active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings t={t} />}
          {activeTab === 'security' && <SecuritySettings t={t} />}
          {activeTab === 'notifications' && <NotificationSettings t={t} />}
          {activeTab === 'preferences' && <PreferenceSettings t={t} />}
        </div>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
      active
        ? 'bg-orange-500 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="text-lg sm:text-xl">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Profile Settings - Shopee responsive style
const ProfileSettings: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => (
  <div className="bg-white shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
    <h2 className="text-lg sm:text-xl font-bold mb-4">{t('profile')}</h2>

    {/* Avatar */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
        A
      </div>
      <div>
        <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors mb-2">{t('changeAvatar')}</button>
        <p className="text-xs sm:text-sm text-gray-500">JPG, PNG. Max 5MB</p>
      </div>
    </div>

    {/* Form */}
    <div className="space-y-4">
      <InputField label={t('profile')} value="Nguyễn Văn A" />
      <InputField label={t('email') || 'Email'} value="user@example.com" type="email" />
      <InputField label={t('phone') || 'Số điện thoại'} value="0123456789" type="tel" />
      <TextAreaField label={t('address') || 'Địa chỉ'} value="123 Đường ABC, Quận XYZ, TP.HCM" />

      <div className="grid grid-cols-2 gap-4">
        <SelectField label={t('gender') || 'Giới tính'} options={[t('male') || 'Nam', t('female') || 'Nữ', t('other') || 'Khác']} value={t('male') || 'Nam'} />
        <InputField label={t('birthDate') || 'Ngày sinh'} value="01/01/1990" type="date" />
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-3 pt-4 border-t">
      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{t('saveChanges')}</button>
      <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{t('cancel')}</button>
    </div>
  </div>
);

// Security Settings
const SecuritySettings: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">{t('changePasswordTitle')}</h2>
      <div className="space-y-4">
        <InputField label={t('currentPassword')} type="password" />
        <InputField label={t('newPassword')} type="password" />
        <InputField label={t('confirmNewPassword')} type="password" />
      </div>
      <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
        {t('updatePassword')}
      </button>
    </div>

    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">{t('twoFactorTitle')}</h2>
      <p className="text-gray-600 mb-4">{t('twoFactorDesc')}</p>
      <ToggleSwitch label={t('twoFactorToggle')} enabled={false} />
    </div>

    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">{t('devicesTitle')}</h2>
      <div className="space-y-3">
        <DeviceItem
          name="Chrome trên Windows"
          location="TP.HCM, Việt Nam"
          time={t('now') || 'Hiện tại'}
          isCurrent
          t={t}
        />
        <DeviceItem
          name="Safari trên iPhone"
          location="Hà Nội, Việt Nam"
          time={t('hoursAgo', { hours: 2 }) || '2 giờ trước'}
          t={t}
        />
      </div>
    </div>
  </div>
);

// Notification Settings
const NotificationSettings: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-bold mb-4">{t('notificationsTitle')}</h2>
    <div className="space-y-4">
      <ToggleSwitch
        label={t('notif_order')}
        description={t('notif_order_desc')}
        enabled={true}
      />
      <ToggleSwitch
        label={t('notif_promo')}
        description={t('notif_promo_desc')}
        enabled={true}
      />
      <ToggleSwitch
        label={t('notif_new_product')}
        description={t('notif_new_product_desc')}
        enabled={false}
      />
      <ToggleSwitch
        label={t('notif_livestream')}
        description={t('notif_livestream_desc')}
        enabled={true}
      />
      <ToggleSwitch
        label={t('notif_community')}
        description={t('notif_community_desc')}
        enabled={false}
      />
    </div>
  </div>
);

// Preference Settings
const PreferenceSettings: React.FC<{ t: ReturnType<typeof useTranslations> }> = ({ t }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLocale = (newLocale: string) => {
    if (!pathname) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">{t('languageAndRegion')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pref_language')}</label>
            <select
              defaultValue={locale}
              onChange={(e) => changeLocale(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="vi">{t('lang_vietnamese') || 'Tiếng Việt'}</option>
              <option value="en">{t('lang_english') || 'English'}</option>
            </select>
          </div>

          <SelectField
            label={t('pref_timezone')}
            options={[t('timezone_gmt7') || '(GMT+7) Bangkok, Hanoi, Jakarta']}
            value={t('timezone_gmt7') || '(GMT+7) Bangkok, Hanoi, Jakarta'}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">{t('theme')}</h2>
        <ToggleSwitch
          label={t('darkMode')}
          description={t('darkModeDesc')}
          enabled={false}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">{t('dangerous_zone')}</h2>
        <p className="text-gray-600 mb-4">{t('dangerous_desc')}</p>
        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">{t('deleteAccount')}</button>
      </div>
    </div>
  );
};

// Reusable Components
const InputField: React.FC<{
  label: string;
  value?: string;
  type?: string;
  placeholder?: string;
}> = ({ label, value, type = 'text', placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
    />
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value?: string;
  placeholder?: string;
}> = ({ label, value, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      defaultValue={value}
      placeholder={placeholder}
      rows={3}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  options: string[];
  value?: string;
}> = ({ label, options, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      defaultValue={value}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const ToggleSwitch: React.FC<{
  label: string;
  description?: string;
  enabled: boolean;
}> = ({ label, description, enabled }) => (
  <div className="flex items-start justify-between py-3 border-b last:border-0">
    <div className="flex-1">
      <div className="font-medium">{label}</div>
      {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
    </div>
    <button
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-green-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'transform translate-x-6' : ''
        }`}
      />
    </button>
  </div>
);

const DeviceItem: React.FC<{
  name: string;
  location: string;
  time: string;
  isCurrent?: boolean;
  t?: ReturnType<typeof useTranslations>;
}> = ({ name, location, time, isCurrent, t }) => (
  <div className="flex items-start justify-between p-4 border rounded-lg">
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        💻
      </div>
      <div>
        <div className="font-medium">
          {name}
      {isCurrent && (() => {
        const _t = t ?? (require('next-intl').useTranslations)('settings');
        return <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{_t('current')}</span>;
          })()}
        </div>
        <div className="text-sm text-gray-500">{location}</div>
        <div className="text-xs text-gray-400">{time}</div>
      </div>
    </div>
    {!isCurrent && (() => {
      const _t = t ?? (require('next-intl').useTranslations)('settings');
      return <button className="text-sm text-red-600 hover:text-red-700">{_t('logout') || 'Đăng xuất'}</button>;
    })()}
  </div>
);
