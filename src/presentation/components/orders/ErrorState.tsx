'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';

export const OrdersErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  const t = useTranslations('orders');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900">{translateSafely(t, 'errorTitle', 'Có lỗi xảy ra')}</h2>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button onClick={onRetry} className="mt-4 inline-flex items-center rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
          {translateSafely(t, 'retry', 'Thử lại')}
        </button>
      </div>
    </div>
  );
};

export default OrdersErrorState;
