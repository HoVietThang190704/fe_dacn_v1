import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
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
  removeAvatar: boolean;
};

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditProfileForm) => Promise<void>;
  isSubmitting: boolean;
  t: ReturnType<typeof useTranslations>;
  user: User | null;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onClose, onSubmit, isSubmitting, t, user }) => {
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
    removeAvatar: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
      removeAvatar: false,
    }));

    setAvatarPreview((prevPreview) => {
      if (prevPreview && prevPreview.startsWith('blob:')) {
        URL.revokeObjectURL(prevPreview);
      }
      return file ? URL.createObjectURL(file) : user?.avatar || null;
    });
  };

  const handleRemoveAvatar = () => {
    setForm((prev) => ({
      ...prev,
      avatarFile: null,
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
      const message = err instanceof Error ? err.message : t('updateError') || 'Không thể cập nhật hồ sơ';
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
            <h3 id="profile-edit-title" className="text-2xl font-semibold text-gray-900">{t('editProfile') || 'Chỉnh sửa thông tin'}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>
        <div className="overflow-y-auto max-h-[calc(90vh-150px)]">
          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-6">
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('avatar') || 'Ảnh đại diện'}</h4>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 shadow-md">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={form.userName || user?.email || 'Avatar preview'}
                        width={96}
                        height={96}
                        className="h-24 w-24 object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-500">
                        {user?.userName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="absolute right-0 bottom-0 flex gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center justify-center rounded-full bg-white p-1 shadow-sm text-red-600 hover:bg-red-50"
                      title={t('removeAvatar') || 'Gỡ ảnh hiện tại'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" className="px-4 py-2 rounded-lg" onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement | null)?.click()}>
                    {t('changeAvatar') || 'Thay đổi ảnh'}
                  </Button>
                  <span className="text-xs text-gray-500">{t('avatarHint') || 'JPG, PNG — tối đa 5MB'}</span>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('personalInfo') || 'Thông tin cá nhân'}</h4>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label={t('name') || 'Họ và tên'}
                  value={form.userName}
                  onChange={handleChange('userName')}
                  placeholder={t('enterName') || 'Nhập họ và tên'}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('phone') || 'Số điện thoại'}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder={t('enterPhone') || 'Nhập số điện thoại'}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('birthDate') || 'Ngày sinh'}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 md:col-span-2"
                />
              </div>
            </section>

            {/* Address Section */}
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{t('address') || 'Địa chỉ'}</h4>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  className="md:col-span-2 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  label={t('addressDetail') || 'Địa chỉ chi tiết'}
                  value={form.address.detail}
                  onChange={handleAddressChange('detail')}
                  placeholder={t('enterAddressDetail') || 'Số nhà, ngõ, tên tòa nhà...'}
                />
                <Input
                  label={t('street') || 'Đường'}
                  value={form.address.street}
                  onChange={handleAddressChange('street')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('commune') || 'Phường/Xã'}
                  value={form.address.commune}
                  onChange={handleAddressChange('commune')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('district') || 'Quận/Huyện'}
                  value={form.address.district}
                  onChange={handleAddressChange('district')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Input
                  label={t('province') || 'Tỉnh/Thành phố'}
                  value={form.address.province}
                  onChange={handleAddressChange('province')}
                  className="rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </section>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 pt-6 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="w-full rounded-lg px-4 py-2 sm:w-auto">
                {t('cancel') || 'Hủy'}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full rounded-lg px-6 py-2 sm:w-auto">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving') || 'Đang lưu...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('saveChanges') || 'Lưu thay đổi'}
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