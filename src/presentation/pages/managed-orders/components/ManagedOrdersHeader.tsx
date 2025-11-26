"use client";

import React from 'react';
import Icon from '@/presentation/components/ui/Icon';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../../utils/translate';

type Props = {
  t: ReturnType<typeof useTranslations>;
  isLoading: boolean;
  onRefresh: () => void;
  successMessage: string | null;
  onCloseSuccess: () => void;
};

export const ManagedOrdersHeader: React.FC<Props> = ({ t, isLoading, onRefresh, successMessage, onCloseSuccess }) => {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500 lg:text-base">{t('subtitle')}</p>
      </div>
      <div className="flex gap-2">
        {successMessage && (
          <div className="mr-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Icon name="CHECK" width={18} height={18} alt={t('dialog.successAlt', { defaultValue: 'Thành công' })} />
                <span>{translateSafely(t, successMessage ?? '', successMessage ?? '')}</span>
              </div>
              <button type="button" onClick={onCloseSuccess} className="text-emerald-700 hover:text-emerald-900">
                {t('actions.close', { defaultValue: 'Đóng' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ManagedOrdersHeader;
