import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { ICONS } from '@/shared/constants/images';
import type { User } from '@/domain/entities/User';

export type AddressFormValues = {
  detail: string;
  street: string;
  commune: string;
  district: string;
  province: string;
};

export type EditProfileForm = {
  userName: string;
  phone: string;
  dateOfBirth: string;
  address: AddressFormValues;
  avatarFile: File | null;
  avatarUploadedUrl?: string | null;
  removeAvatar: boolean;
};

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditProfileForm) => Promise<void>;
  isSubmitting: boolean;
  onAvatarUpload?: (file: File) => Promise<string>;
  t: ReturnType<typeof useTranslations>;
  user: User | null;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onClose, onSubmit, isSubmitting, onAvatarUpload, t, user }) => {
  const [form, setForm] = useState<EditProfileForm>({
    userName: '',
    phone: '',
    dateOfBirth: '',
    address: {
      detail: '',
      street: '',
      commune: '',
      district: '',
      province: '',
    },
    avatarFile: null,
    avatarUploadedUrl: null,
    removeAvatar: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        userName: user?.userName || '',
        phone: user?.phone || '',
        dateOfBirth: toDateInputValue(user?.dateOfBirth),
        address: {
          detail: user?.address?.detail || '',
          street: user?.address?.street || '',
          commune: user?.address?.commune || '',
          district: user?.address?.district || '',
          province: user?.address?.province || '',
        },
        avatarFile: null,
        avatarUploadedUrl: null,
        removeAvatar: false,
      });
      setAvatarPreview(user?.avatar || null);
      setErrorMessage(null);
    }
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (field: keyof EditProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof AddressFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setForm((prev) => ({
      ...prev,
      avatarFile: file,
      avatarUploadedUrl: null,
      removeAvatar: false,
    }));

    setAvatarPreview((prevPreview) => {
      if (prevPreview && prevPreview.startsWith('blob:')) {
        URL.revokeObjectURL(prevPreview);
      }
      return file ? URL.createObjectURL(file) : user?.avatar || null;
    });
    if (file && typeof onAvatarUpload === 'function') {
      setIsAvatarUploading(true);
      onAvatarUpload(file)
        .then((url: string) => {
          setForm((prev) => ({ ...prev, avatarUploadedUrl: url, avatarFile: null, removeAvatar: false }));
          setAvatarPreview(url || null);
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : t('uploadAvatarError');
          setErrorMessage(message);
        })
        .finally(() => setIsAvatarUploading(false));
    }
  };

  const handleRemoveAvatar = () => {
    setForm((prev) => ({
      ...prev,
      avatarFile: null,
      avatarUploadedUrl: null,
      removeAvatar: true,
    }));

    setAvatarPreview((prevPreview) => {
      if (prevPreview && prevPreview.startsWith('blob:')) {
        URL.revokeObjectURL(prevPreview);
      }
      return null;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await onSubmit(form);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('updateError');
      setErrorMessage(message);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all duration-200 ease-out scale-100">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-5 bg-gradient-to-r from-emerald-50 to-green-50">
          <div>
            <h3 id="profile-edit-title" className="text-2xl font-semibold text-gray-900">{t('editProfile')}</h3>
          </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="-mr-2 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700" aria-label={t('cancel')}>
              <Image src={ICONS.CROSS || ICONS.PLACEHOLDER} alt={t('cancel')} width={20} height={20} />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto max-h-[calc(90vh-150px)]">
          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-6">
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('avatar')}</h4>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 shadow-md">
                      {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={form.userName || user?.email || t('avatar')}
                        width={96}
                        height={96}
                        className="h-24 w-24 object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-500">
                        {user?.userName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || t('unknown')}
                      </span>
                    )}
                  </div>
                  {isAvatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25" aria-live="polite">
                      <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  <div className="absolute right-0 bottom-0 flex gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center justify-center rounded-full bg-white p-1 shadow-sm text-red-600 hover:bg-red-50"
                      title={t('removeAvatar')}
                      disabled={isAvatarUploading || isSubmitting}
                    >
                      <Image src={ICONS.CROSS || ICONS.PLACEHOLDER} alt={t('removeAvatar')} width={14} height={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    aria-hidden="true"
                    disabled={isAvatarUploading || isSubmitting}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAvatarUploading || isSubmitting}
                  >
                    {isAvatarUploading ? (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('uploading')}
                      </div>
                    ) : (
                      t('changeAvatar')
                    )}
                  </Button>
                  <span className="text-xs text-gray-500">{t('avatarHint')}</span>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Image src={ICONS.EDIT || ICONS.PLACEHOLDER} alt={t('personalInfo')} width={16} height={16} className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('personalInfo')}</h4>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label={t('name')}
                  value={form.userName}
                  onChange={handleChange('userName')}
                  placeholder={t('enterName')}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('phone')}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder={t('enterPhone')}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                  <Input
                  label={t('birthDate')}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 md:col-span-2"
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image src={ICONS.LOCATION || ICONS.PLACEHOLDER} alt={t('address')} width={16} height={16} className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('address')}</h4>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  className="md:col-span-2 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  label={t('addressDetail')}
                  value={form.address.detail}
                  onChange={handleAddressChange('detail')}
                  placeholder={t('enterAddressDetail')}
                />
                  <Input
                  label={t('street')}
                  value={form.address.street}
                  onChange={handleAddressChange('street')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('commune')}
                  value={form.address.commune}
                  onChange={handleAddressChange('commune')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('district')}
                  value={form.address.district}
                  onChange={handleAddressChange('district')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('province')}
                  value={form.address.province}
                  onChange={handleAddressChange('province')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </section>

            {errorMessage && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-3">
                    <div aria-live="polite">
                    <Image src={ICONS.WARNING || ICONS.PLACEHOLDER} alt={t('error')} width={20} height={20} className="w-5 h-5 text-red-500" />
                  {errorMessage}
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 pt-6 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="w-full rounded-lg px-4 py-2 sm:w-auto">
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || isAvatarUploading} aria-busy={isSubmitting || isAvatarUploading} className="w-full rounded-lg px-6 py-2 sm:w-auto">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image src={ICONS.YES || ICONS.PLACEHOLDER} alt={t('saveChanges')} width={16} height={16} className="w-4 h-4" />
                    {t('saveChanges')}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const toDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};