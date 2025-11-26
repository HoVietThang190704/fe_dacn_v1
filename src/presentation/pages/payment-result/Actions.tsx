"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  status: 'success' | 'failed' | 'unknown';
  onViewOrder: () => void;
  onBackHome: () => void;
  onRetryPayment: () => void;
};

export const Actions: React.FC<Props> = ({ status, onViewOrder, onBackHome, onRetryPayment }) => {
  const t = useTranslations('paymentResult');

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <button onClick={onViewOrder} className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">{t('actions.viewOrder')}</button>
      <button onClick={onBackHome} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">{t('actions.backHome')}</button>
      {(status === 'failed' || status === 'unknown') && (
        <button onClick={onRetryPayment} className="flex-1 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">{t('actions.retryPayment')}</button>
      )}
    </div>
  );
};

export default Actions;
