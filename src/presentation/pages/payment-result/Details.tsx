import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  orderNumber: string;
  orderId: string;
  responseCode: string;
};

export const Details: React.FC<Props> = ({ orderNumber, orderId, responseCode }) => {
  const t = useTranslations('paymentResult');
  const labels = useTranslations('labels');

  const placeholder = labels('placeholder');

  return (
    <div className="mt-8 bg-white rounded-xl shadow-inner p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('title')}</h2>
      <dl className="space-y-3">
        <div className="flex justify-between border-b pb-2">
          <dt className="text-sm text-gray-500">{t('details.orderNumber')}</dt>
          <dd className="text-sm font-medium text-gray-900">{orderNumber || orderId || placeholder}</dd>
        </div>
        <div className="flex justify-between border-b pb-2">
          <dt className="text-sm text-gray-500">{t('details.orderId')}</dt>
          <dd className="text-sm font-medium text-gray-900">{orderId || placeholder}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-gray-500">{t('details.responseCode')}</dt>
          <dd className="text-sm font-medium text-gray-900">{responseCode || placeholder}</dd>
        </div>
      </dl>
    </div>
  );
};

export default Details;
