"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ICONS } from '@/shared/constants/images';
import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';
import { useRegisterShopOwnerViewModel } from '@/presentation/viewmodels/useRegisterShopOwnerViewModel';
import { container } from '@/presentation/di/container';
import LoadingSpinner from '@/presentation/components/profile/LoadingSpinner';

interface RegisterShopOwnerPageProps {
  profile: UserProfile;
}

const statusIconMap: Record<string, string> = {
  pending: ICONS.WARNING || ICONS.PREFERENCES,
  approved: ICONS.CHECK || ICONS.YES,
  rejected: ICONS.CROSS || ICONS.WARNING,
  none: ICONS.QUESTION || ICONS.PREFERENCES
};

const statusToneMap: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  none: 'bg-gray-50 text-gray-600 border-gray-200'
};

const RegisterShopOwnerPage: React.FC<RegisterShopOwnerPageProps> = ({ profile }) => {
  const t = useTranslations('profile');
  const { request, isLoading, isSubmitting, error, submit } = useRegisterShopOwnerViewModel(
    container.getMyRegisterShopOwnerRequestUseCase,
    container.submitRegisterShopOwnerRequestUseCase
  );

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statusKey = request?.status ?? 'none';
  const statusClassName = statusToneMap[statusKey] || statusToneMap.none;
  const statusLabel = t(`registerShopOwner.status.${statusKey}`);
  const statusDescription = t(`registerShopOwner.statusDescription.${statusKey}`);

  const addressText = useMemo(() => {
    const segments = [
      profile.address?.detail,
      profile.address?.street,
      profile.address?.commune,
      profile.address?.district,
      profile.address?.province
    ].filter((value): value is string => Boolean(value && value.trim().length));

    if (segments.length === 0) {
      return t('registerShopOwner.form.noAddress');
    }
    return segments.join(', ');
  }, [profile.address, t]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificateFile(file);
      setLocalError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!certificateFile) {
      setLocalError(t('registerShopOwner.form.required'));
      return;
    }

    const result = await submit(certificateFile);
    if (result.success) {
      window.alert(t('registerShopOwner.messages.success'));
      setLocalError(null);
      setCertificateFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    } else if (result.error) {
      window.alert(result.error);
    } else {
      window.alert(t('registerShopOwner.messages.error'));
    }
  };

  if (isLoading && !request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const isPendingReview = request?.status === 'pending';
  const isApproved = request?.status === 'approved';
  const isSubmissionDisabled = isPendingReview || isApproved;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">{t('registerShopOwner.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('registerShopOwner.subtitle')}</p>
        </div>

        <div className={`mb-6 rounded-2xl border ${statusClassName} p-4 flex gap-4`}>
          <Image src={statusIconMap[statusKey] || ICONS.PREFERENCES} alt={statusKey} width={32} height={32} className="h-8 w-8" />
          <div>
            <p className="text-base font-semibold">{statusLabel}</p>
            <p className="text-sm mt-1">{statusDescription}</p>
          </div>
        </div>

        {(error || localError) && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || localError}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{t('registerShopOwner.form.userInfoTitle')}</h2>
            <div className="mt-4 grid gap-3 text-sm text-gray-700">
              <div className="flex items-start justify-between">
                <span className="text-gray-500">{t('name')}</span>
                <span className="font-medium">{profile.userName || '-'}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-500">{t('email')}</span>
                <span className="font-medium break-all">{profile.email}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-500">{t('phone')}</span>
                <span className="font-medium">{profile.phone || t('registerShopOwner.form.noPhone')}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-500">{t('registerShopOwner.form.address')}</span>
                <span className="font-medium text-right ml-4">{addressText}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('registerShopOwner.form.certificateTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('registerShopOwner.form.uploadHint')}</p>
              </div>
              <Image src={ICONS.IMAGE || ICONS.PLACEHOLDER} alt="certificate" width={48} height={48} className="hidden sm:block" />
            </div>

            <div className="mt-4">
              <input
                ref={fileInputRef}
                id="certificate-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmissionDisabled}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmissionDisabled}
                >
                  {certificateFile ? t('registerShopOwner.form.replaceFile') : t('registerShopOwner.form.selectFile')}
                </Button>
                {certificateFile && (
                  <span className="text-sm text-gray-600">
                    {t('registerShopOwner.form.selectedFile', { name: certificateFile.name })}
                  </span>
                )}
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">{t('registerShopOwner.form.preview')}</p>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <Image src={previewUrl} alt="certificate preview" width={600} height={400} className="w-full object-contain" unoptimized priority />
                  </div>
                </div>
              )}

              {isPendingReview && (
                <p className="mt-3 text-sm text-gray-500">{t('registerShopOwner.form.locked')}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isLoading || isSubmissionDisabled}>
                {isSubmitting ? t('registerShopOwner.form.submitting') : t('registerShopOwner.form.submit')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterShopOwnerPage;
