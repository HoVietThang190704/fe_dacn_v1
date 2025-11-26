"use client";

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { STATUS_STYLES, type ResultStatus } from './payment-result/constants';
import { Summary } from './payment-result/Summary';
import { Details } from './payment-result/Details';
import { Actions } from './payment-result/Actions';

export const PaymentResultPage = () => {
  const t = useTranslations('paymentResult');
  const labelT = useTranslations('labels');
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = (searchParams.get('status') ?? 'unknown').toLowerCase();
  const status: ResultStatus = statusParam === 'success' || statusParam === 'failed' ? (statusParam as ResultStatus) : 'unknown';
  const orderId = searchParams.get('orderId') ?? '';
  const orderNumber = searchParams.get('orderNumber') ?? '';
  const responseCode = searchParams.get('code') ?? '';
  const extraMessage = searchParams.get('message') ?? '';

  const summary = useMemo(() => {
    const base = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
    const mappedOrderNumber = orderNumber || orderId || labelT('placeholder');

    if (status === 'success') {
      return {
        ...base,
        title: t('successTitle'),
        description: t('successMessage', { orderNumber: mappedOrderNumber }),
      };
    }

    if (status === 'failed') {
      return {
        ...base,
        title: t('failedTitle'),
        description: t('failedMessage', { code: responseCode || labelT('placeholder') }),
      };
    }

    return {
      ...base,
      title: t('unknownTitle'),
      description: t('unknownMessage'),
    };
  }, [orderId, orderNumber, responseCode, status, t, labelT]);

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/main/orders/${orderId}`);
      return;
    }
    router.push('/main/orders');
  };

  const handleBackHome = () => {
    router.push('/main');
  };

  const handleRetryPayment = () => {
    if (orderId) {
      router.push(`/main/orders/${orderId}`);
      return;
    }
    router.push('/main/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className={`rounded-2xl shadow-sm p-8 ${summary.bg}`}>
          <Summary
            iconSrc={summary.icon}
            title={summary.title}
            description={summary.description}
            statusLabel={t(`status.${status}`) || status.toUpperCase()}
            styles={{ bg: summary.bg, text: summary.text, badge: summary.badge }}
          />
          {extraMessage && <p className="text-sm text-gray-500 text-center mt-3">{extraMessage}</p>}
          <Details orderNumber={orderNumber} orderId={orderId} responseCode={responseCode} />
          <Actions status={status} onViewOrder={handleViewOrder} onBackHome={handleBackHome} onRetryPayment={handleRetryPayment} />
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
