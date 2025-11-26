'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

export const OrdersLoadingState = () => {
  const t = useTranslations('orders');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
          <Image src={ICONS.TRUCK_SIDE} alt={translateSafely(t, 'loading')} width={40} height={40} />
        </div>
        <p className="text-sm text-gray-600">{translateSafely(t, 'loading')}</p>
      </div>
    </div>
  );
};

export default OrdersLoadingState;
