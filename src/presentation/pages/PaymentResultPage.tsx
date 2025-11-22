'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const STATUS_STYLES: Record<string, { icon: string; bg: string; text: string; badge: string }> = {
  success: {
    icon: '✅',
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  failed: {
    icon: '⚠️',
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
  },
  unknown: {
    icon: '⏳',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
};

export const PaymentResultPage = () => {
  const t = useTranslations('paymentResult');
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = (searchParams.get('status') ?? 'unknown').toLowerCase();
  const status: 'success' | 'failed' | 'unknown' =
    statusParam === 'success' || statusParam === 'failed' ? (statusParam as 'success' | 'failed') : 'unknown';
  const orderId = searchParams.get('orderId') ?? '';
  const orderNumber = searchParams.get('orderNumber') ?? '';
  const responseCode = searchParams.get('code') ?? '';
  const extraMessage = searchParams.get('message') ?? '';

  const summary = useMemo(() => {
    const base = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
    const mappedOrderNumber = orderNumber || orderId || '—';

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
        description: t('failedMessage', { code: responseCode || '—' }),
      };
    }

    return {
      ...base,
      title: t('unknownTitle'),
      description: t('unknownMessage'),
    };
  }, [orderId, orderNumber, responseCode, status, t]);

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
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`text-5xl ${summary.text}`} aria-hidden="true">
              {summary.icon}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${summary.badge}`}>
              {status.toUpperCase()}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{summary.title}</h1>
            <p className="text-gray-700 max-w-xl">{summary.description}</p>
            {extraMessage && <p className="text-sm text-gray-500">{extraMessage}</p>}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-inner p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('title')}</h2>
            <dl className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-sm text-gray-500">{t('details.orderNumber')}</dt>
                <dd className="text-sm font-medium text-gray-900">{orderNumber || orderId || '—'}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-sm text-gray-500">{t('details.orderId')}</dt>
                <dd className="text-sm font-medium text-gray-900">{orderId || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('details.responseCode')}</dt>
                <dd className="text-sm font-medium text-gray-900">{responseCode || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleViewOrder}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('actions.viewOrder')}
            </button>
            <button
              onClick={handleBackHome}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t('actions.backHome')}
            </button>
            {(status === 'failed' || status === 'unknown') && (
              <button
                onClick={handleRetryPayment}
                className="flex-1 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                {t('actions.retryPayment')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
