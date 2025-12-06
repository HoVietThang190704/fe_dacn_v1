import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { Button } from '@/components/ui';
import { useUserProfileViewModel } from '../../viewmodels/useUserProfileViewModel';
import { container } from '../../di/container';
import type { User, UpdateUserDto } from '@/domain/entities/User';
import { ProfileEditModal, EditProfileForm, AddressFormValues } from './ProfileEditModal';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PreferencesSection from './PreferencesSection';

type TabKey = 'profile' | 'security' | 'notifications' | 'preferences';

type ProfileViewModel = ReturnType<typeof useUserProfileViewModel>;
type FeedbackState = { status: 'success' | 'error'; message: string };
type ProfileField = { key: string; label: string; value: React.ReactNode };

const buildAddressPayload = (address: AddressFormValues): User['address'] | null | undefined => {
  if (!address) return undefined;

  const sanitized = {
    detail: address.detail.trim() || undefined,
    street: address.street.trim() || undefined,
    commune: address.commune.trim() || undefined,
    district: address.district.trim() || undefined,
    province: address.province.trim() || undefined,
  } as User['address'];

  const hasValue = Object.values(sanitized || {}).some(Boolean);
  return hasValue ? sanitized : null;
};

interface Props {
  activeTab: TabKey;
  userId: string;
}

export const SettingsSections: React.FC<Props> = ({ activeTab, userId }) => {
  const t = useTranslations('settings');
  const viewModel = useUserProfileViewModel(
    container.getUserProfileUseCase,
    container.updateUserProfileUseCase,
    container.uploadUserAvatarUseCase,
    userId
  );

  if (activeTab === 'profile') {
    return <ProfileSection t={t} viewModel={viewModel} />;
  }

  if (activeTab === 'security') {
    return <SecuritySection />;
  }

  if (activeTab === 'notifications') {
    return <NotificationsSection />;
  }

  return <PreferencesSection />;
};

const ProfileSection: React.FC<{ t: ReturnType<typeof useTranslations>; viewModel: ProfileViewModel }> = ({ t, viewModel }) => {
  const locale = useLocale();
  const { user, isLoading, error, isUpdating, updateProfile, uploadAvatar, refresh } = viewModel;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const label = useCallback((key: string) => {
    try {
      const value = t(key as never) as string;
      if (!value || value.includes('.')) return key;
      return value;
    } catch {
      return key;
    }
  }, [t]);

  const handleFormSubmit = async (values: EditProfileForm) => {
    try {
      const updates: UpdateUserDto = {
        userName: values.userName,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth || undefined,
      };

      const addressPayload = buildAddressPayload(values.address);
      if (addressPayload !== undefined) {
        updates.address = addressPayload;
      }

      if (values.removeAvatar) {
        updates.avatar = null;
      } else if (values.avatarUploadedUrl) {
        updates.avatar = values.avatarUploadedUrl;
      } else if (values.avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(values.avatarFile);
          updates.avatar = avatarUrl;
        } catch (uploadError) {
          const message = uploadError instanceof Error
            ? uploadError.message
            : t('uploadAvatarError') || '';
          setFeedback({ status: 'error', message });
          throw uploadError;
        }
      }

      await updateProfile(updates);

      setFeedback({
        status: 'success',
        message: t('profileUpdated'),
      });
      setIsEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('updateError');
      setFeedback({ status: 'error', message });
      throw err;
    }
  };

  const fields = useMemo<ProfileField[]>(() => {
    if (!user) return [];
    const yesText = t('yes');
    const noText = t('no');

    return [
      {
        key: 'userName',
        label: label('name'),
        value: user.userName || t('unknown'),
      },
      {
        key: 'email',
        label: label('email'),
        value: user.email || t('unknown'),
      },
      {
        key: 'phone',
        label: label('phone'),
        value: user.phone || t('unknown'),
      },
      {
        key: 'dateOfBirth',
        label: label('birthDate'),
        value: formatDateOnly(user.dateOfBirth, locale) || t('unknown'),
      },
      {
        key: 'address',
        label: label('address'),
        value: formatAddress(user.address) || t('unknown'),
      },
      {
        key: 'role',
        label: label('role'),
        value: formatRole(user.role),
      },
      {
        key: 'isVerified',
        label: label('verified'),
        value:
          user.isVerified === undefined
            ? t('unknown')
            : (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {user.isVerified ? yesText : noText}
                </span>
              ),
      },
      {
        key: 'createdAt',
        label: label('createdAt'),
        value: formatDateTime(user.createdAt, locale) || t('unknown'),
      },
      {
        key: 'updatedAt',
        label: label('updatedAt'),
        value: formatDateTime(user.updatedAt, locale) || t('unknown'),
      },
    ];
  }, [label, t, user, locale]);

  let body: React.ReactNode;

  if (isLoading) {
    body = <ProfileSkeleton />;
  } else if (error) {
    body = (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-700">
          {t('updateError')}
        </h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <div className="mt-4">
          <Button type="button" variant="primary" onClick={refresh}>
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  } else if (!user) {
    body = (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        {t('userNotFound')}
      </div>
    );
  } else {
    body = (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <AvatarPreview user={user} />
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{user.userName || user.email}</h2>
              <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
              {user.role && (
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-700">
                  {formatRole(user.role)}
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Button variant="primary" onClick={() => setIsEditOpen(true)} className="w-full md:w-auto">
              {t('editProfile')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <InfoField key={field.key} label={field.label} value={field.value} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
          {feedback && (
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                feedback.status === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              <span className="text-sm sm:text-base">{feedback.message}</span>
              <button
                type="button"
                className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide"
                onClick={() => setFeedback(null)}
                aria-label={t('close')}
              >
                <Image src={ICONS.CROSS || ICONS.PLACEHOLDER} width={12} height={12} alt={t('close')} />
              </button>
            </div>
          )}

      {body}

      <ProfileEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isUpdating}
        onAvatarUpload={uploadAvatar}
        t={t}
        user={user}
      />
    </div>
  );
};

const ProfileSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  </div>
);

const AvatarPreview: React.FC<{ user: User | null }> = ({ user }) => {
  const t = useTranslations('settings');
  if (user?.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.userName || user.email || t('avatar')}
        width={80}
        height={80}
        className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-gray-200 object-cover"
        unoptimized
      />
    );
  }

  const initials = getInitials(user);

  return (
    <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-emerald-100 text-base sm:text-lg md:text-xl font-semibold text-emerald-700">
      {initials}
    </div>
  );
};

const InfoField: React.FC<ProfileField> = ({ label, value }) => {
  const tLocal = useTranslations('settings');
  const content = typeof value === 'string'
    ? value.trim().length ? value : tLocal('unknown')
    : value ?? tLocal('unknown');

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm sm:text-base text-gray-800 break-words">{content}</div>
    </div>
  );
};

const getInitials = (user: User | null): string => {
  const source = user?.userName || user?.email || '';
  if (!source) return '?';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return source.slice(0, 2).toUpperCase() || '';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
};

const formatDateOnly = (value?: string | null, locale = 'en-US'): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value?: string | null, locale = 'en-US'): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAddress = (address?: User['address'] | null): string => {
  if (!address) return '';
  const parts = [address.detail, address.street, address.commune, address.district, address.province]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length);
  return parts.join(', ');
};

const formatRole = (role?: string): string => {
  if (!role) return '–';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default SettingsSections;

