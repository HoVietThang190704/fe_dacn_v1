'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';

export const OrdersLoadingState = () => {
  const t = useTranslations('orders');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-sm text-gray-600">{translateSafely(t, 'loading', 'Đang tải đơn hàng...')}</p>
      </div>
    </div>
  );
};

export default OrdersLoadingState;
