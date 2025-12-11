"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderDetailViewModel } from '../viewmodels/useOrderDetailViewModel';
import { container } from '../di/container';
import { ORDER_STATUS, OrderStatus } from '@/domain/entities/Order';
import { ORDER_CONFIG } from '@/presentation/config/orderConfig';
import useCurrency from '@/presentation/hooks/useCurrency';
import useOrderStatus from '@/presentation/hooks/useOrderStatus';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { CancelOrderDialog } from '../components/CancelOrderDialog';
import LoadingState from '@/presentation/components/ui/LoadingState';
import ErrorState from '@/presentation/components/ui/ErrorState';
import NotFoundState from '@/presentation/components/ui/NotFoundState';

interface OrderDetailPageProps {
  orderId: string;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
  const t = useTranslations('order');
  const ordersT = useTranslations('orders');
  
  const { formatCurrency } = useCurrency();
  const locale = useLocale();
  const router = useRouter();
  const { getStatusColor } = useOrderStatus();
  const { cancelOrder, isLoading: isCancelling, error: cancelError } = useCancelOrder();
  const paymentMethodLabels = useMemo(
    () => ({
      cod: t('payment.methods.cod'),
      vnpay: t('payment.methods.vnpay'),
    }),
    [t]
  );

  const paymentStatusLabels = useMemo(
    () => ({
      pending: t('payment.status.pending'),
      paid: t('payment.status.paid'),
      failed: t('payment.status.failed'),
      refunded: t('payment.status.refunded'),
    }),
    [t]
  );
  const viewModel = useOrderDetailViewModel(container.getOrderByIdUseCase, orderId);
  const currentOrderId = viewModel.order?.id;
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), ORDER_CONFIG.SUCCESS_MESSAGE_DURATION);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handlePayOrder = useCallback(async () => {
    if (!currentOrderId) return;

    try {
      setIsPaying(true);
      setPaymentError(null);

      const frontendRedirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${locale}/payment/vnpay/result`
        : undefined;
      const vnPayLocale = locale?.toLowerCase().startsWith('vi') ? 'vn' : 'en';

      const session = await container.createVNPayPaymentSessionUseCase.execute({
        orderId: currentOrderId,
        frontendRedirectUrl,
        locale: vnPayLocale,
      });

      window.location.href = session.paymentUrl;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : t('errors.paymentFailed'));
    } finally {
      setIsPaying(false);
    }
  }, [currentOrderId, locale, t]);

  const handleContactSupport = useCallback(() => {
    const supportPath = locale ? `/${locale}/main/support` : '/main/support';
    router.push(supportPath);
  }, [locale, router]);

  if (viewModel.isLoading) {
    return <LoadingState message={t('loading')} />;
  }

  if (viewModel.error) {
    return <ErrorState message={viewModel.error} onRetry={viewModel.refresh} retryLabel={t('retry')} />;
  }

  if (!viewModel.order) {
    return <NotFoundState title={t('notFound')} message={t('notFoundMessage')} />;
  }

  const order = viewModel.order;

  const handleConfirmCancel = async (reason: string) => {
    if (!order?.id) return;

    try {
      await cancelOrder(order.id, reason);
      setSuccessMessage(ordersT('success.cancelledSuccessfully'));
      setCancelDialogOpen(false);
      await viewModel.refresh();
    } catch {}
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return t('statusLabels.pending');
      case ORDER_STATUS.CONFIRMED:
        return t('statusLabels.confirmed');
      case ORDER_STATUS.PREPARING:
        return t('statusLabels.preparing');
      case ORDER_STATUS.SHIPPING:
        return t('statusLabels.shipping');
      case ORDER_STATUS.DELIVERED:
        return t('statusLabels.delivered');
      case ORDER_STATUS.CANCELLED:
        return t('statusLabels.cancelled');
      case ORDER_STATUS.REFUNDED:
        return t('statusLabels.refunded');
      default:
        return status;
    }
  };

  const addressSegments = [
    order.shippingAddress?.address,
    order.shippingAddress?.ward,
    order.shippingAddress?.district,
    order.shippingAddress?.province,
  ].filter(Boolean);

  const fullAddress = order.shippingAddress?.fullAddress ?? addressSegments.join(', ');
  const recipientName = order.shippingAddress?.recipientName;
  const recipientPhone = order.shippingAddress?.phone;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {t('backToOrders')}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('orderDetails')}</h1>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderNumber')}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderDate')}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleString(locale)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('status')}</h3>
              <span className={`inline-flex px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.statusDisplay || getStatusText(order.status)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('totalAmount')}</h3>
              <p className="text-base sm:text-lg font-semibold text-orange-500">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>

          
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('shippingAddress')}</h3>
            <div className="space-y-1">
              {recipientName && (
                <p className="text-gray-900 text-sm sm:text-base font-medium">
                  {recipientName} {recipientPhone && <span className="text-gray-500">| {recipientPhone}</span>}
                </p>
              )}
              <p className="text-gray-900 text-sm sm:text-base">{fullAddress}</p>
            </div>
          </div>

          
          <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('paymentMethod')}</h3>
              <p className="text-gray-900 text-sm sm:text-base">
                {paymentMethodLabels[order.paymentMethod as keyof typeof paymentMethodLabels] ?? order.paymentMethod}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('paymentStatus')}</h3>
              <p className="text-gray-900 text-sm sm:text-base">
                {paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels] ?? order.paymentStatus}
              </p>
            </div>
          </div>

          {order.note && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('note')}</h3>
              <p className="text-gray-900 text-sm sm:text-base">{order.note}</p>
            </div>
          )}

          {order.cancelReason && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-red-500 mb-1">{t('cancelReason')}</h3>
              <p className="text-red-600 text-sm sm:text-base">{order.cancelReason}</p>
            </div>
          )}
        </div>

        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('items')}</h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={item.productImage || ORDER_CONFIG.FALLBACK_IMAGE}
                    alt={item.productName}
                    width={ORDER_CONFIG.IMAGE_WIDTH}
                    height={ORDER_CONFIG.IMAGE_HEIGHT}
                    className={`${ORDER_CONFIG.IMAGE_SIZE_CLASS} object-cover rounded-lg`}
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-2">{item.productName}</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span>{t('quantity')}: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                    <span>{t('price')}: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span></span>
                  </div>
                </div>

                <div className="text-center sm:text-right flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-1">{t('subtotal')}</p>
                  <p className="text-base sm:text-lg font-semibold text-orange-500">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{t('subtotalLabel')}</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{t('shippingFee')}</span>
              <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>{t('discount')}</span>
                <span className="font-medium">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg sm:text-xl font-bold pt-3 border-t">
              <span>{t('totalAmount')}</span>
              <span className="text-orange-500">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {order.paymentStatus === 'pending' && order.paymentMethod !== 'cod' && (
              <button
                onClick={handlePayOrder}
                disabled={isPaying}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isPaying ? t('actions.payProcessing') : t('actions.payNow')}
              </button>
            )}
            <button
              onClick={handleContactSupport}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t('actions.contactSupport')}
            </button>
            {order.canBeCancelled && (
              <button
                onClick={() => setCancelDialogOpen(true)}
                disabled={isCancelling}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t('actions.cancelOrder')}
              </button>
            )}
          </div>
          {successMessage && <div className="mt-3 text-sm text-green-600">{successMessage}</div>}
          {paymentError && <div className="mt-3 text-sm text-red-600">{paymentError}</div>}
        </div>
        <CancelOrderDialog
          isOpen={cancelDialogOpen}
          orderNumber={order.orderNumber}
          isLoading={isCancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelDialogOpen(false)}
          error={cancelError}
        />
      </div>
    </div>
  );
};

