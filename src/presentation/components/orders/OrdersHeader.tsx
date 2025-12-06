'use client';

import Image from 'next/image';
import React from 'react';
import { useTranslations } from 'next-intl';
import { ICONS } from '@/shared/constants/images';

interface OrdersHeaderProps {
  title?: string;
  subtitle?: string | null;
  isStatsError?: boolean;
  statsError?: string | null;
  isStatsLoading?: boolean;
  onRefresh?: () => void;
  successMessage?: string | null;
  onCloseSuccess?: () => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  title,
  subtitle,
  statsError,
  isStatsLoading,
  onRefresh,
  successMessage,
  onCloseSuccess,
}) => {
  const t = useTranslations('orders');

  return (
    <>
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 relative flex-shrink-0">
              <Image src={ICONS.CHECK} alt={t('dialog.successAlt')} fill sizes="24px" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500 md:text-base">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {statsError && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">{statsError}</span>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50"
          >
            <div className="w-4 h-4 relative flex-shrink-0">
              <Image src={ICONS.AROUND} alt={t('actions.refresh')} fill sizes="16px" />
            </div>
            {t('actions.refresh')}
          </button>
        </div>
      </header>
    </>
  );
};

export default OrdersHeader;
