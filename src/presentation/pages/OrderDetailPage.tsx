'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useOrderDetailViewModel } from '../viewmodels/useOrderDetailViewModel';
import { container } from '../di/container';
import { ORDER_STATUS, OrderStatus, PaymentMethod, PaymentStatus } from '@/domain/entities/Order';

interface OrderDetailPageProps {
  orderId: string;
}

const FALLBACK_IMAGE = '/img/Background.png';

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
  const t = useTranslations('order');
  const locale = useLocale();
  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value),
    [locale]
  );
  const paymentMethodLabels = useMemo(
    () => ({
      cod: t('payment.methods.cod'),
      momo: t('payment.methods.momo'),
      zalopay: t('payment.methods.zalopay'),
      vnpay: t('payment.methods.vnpay'),
      card: t('payment.methods.card'),
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
  const [isPaying, setIsPaying] = useState(false);

  const handlePayOrder = React.useCallback(async () => {
    if (!viewModel.order) return;

    try {
      setIsPaying(true);
      await container.payOrderUseCase.execute({ orderId: viewModel.order.id });
      // Refresh order data
      viewModel.refresh();
    } catch (error) {
      console.error('Payment failed:', error);
      alert(t('errors.paymentFailed'));
    } finally {
      setIsPaying(false);
    }
  }, [t, viewModel]);

  if (viewModel.isLoading) {
    return <LoadingState />;
  }

  if (viewModel.error) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} t={t} />;
  }

  if (!viewModel.order) {
    return <NotFoundState t={t} />;
  }

  const order = viewModel.order;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ORDER_STATUS.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case ORDER_STATUS.PREPARING:
        return 'bg-indigo-100 text-indigo-800';
      case ORDER_STATUS.SHIPPING:
        return 'bg-purple-100 text-purple-800';
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ORDER_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ORDER_STATUS.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {t('backToOrders', { defaultValue: 'Quay lại đơn hàng' })}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('orderDetails', { defaultValue: 'Chi tiết đơn hàng' })}</h1>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderNumber', { defaultValue: 'Mã đơn hàng' })}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderDate', { defaultValue: 'Ngày đặt' })}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('status', { defaultValue: 'Trạng thái' })}</h3>
              <span className={`inline-flex px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.statusDisplay || getStatusText(order.status)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('totalAmount', { defaultValue: 'Tổng tiền' })}</h3>
              <p className="text-base sm:text-lg font-semibold text-orange-500">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('shippingAddress', { defaultValue: 'Địa chỉ giao hàng' })}</h3>
            <div className="space-y-1">
              {recipientName && (
                <p className="text-gray-900 text-sm sm:text-base font-medium">
                  {recipientName} {recipientPhone && <span className="text-gray-500">| {recipientPhone}</span>}
                </p>
              )}
              <p className="text-gray-900 text-sm sm:text-base">{fullAddress}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('paymentMethod', { defaultValue: 'Phương thức thanh toán' })}</h3>
              <p className="text-gray-900 text-sm sm:text-base">
                {paymentMethodLabels[order.paymentMethod as keyof typeof paymentMethodLabels] ?? order.paymentMethod}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('paymentStatus', { defaultValue: 'Trạng thái thanh toán' })}</h3>
              <p className="text-gray-900 text-sm sm:text-base">
                {paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels] ?? order.paymentStatus}
              </p>
            </div>
          </div>

          {order.note && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('note', { defaultValue: 'Ghi chú' })}</h3>
              <p className="text-gray-900 text-sm sm:text-base">{order.note}</p>
            </div>
          )}

          {order.cancelReason && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-red-500 mb-1">{t('cancelReason', { defaultValue: 'Lý do hủy' })}</h3>
              <p className="text-red-600 text-sm sm:text-base">{order.cancelReason}</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('items', { defaultValue: 'Sản phẩm' })}</h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={item.productImage || FALLBACK_IMAGE}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-2">{item.productName}</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span>{t('quantity', { defaultValue: 'Số lượng' })}: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                    <span>{t('price', { defaultValue: 'Đơn giá' })}: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span></span>
                  </div>
                </div>

                <div className="text-center sm:text-right flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-1">{t('subtotal', { defaultValue: 'Thành tiền' })}</p>
                  <p className="text-base sm:text-lg font-semibold text-orange-500">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{t('subtotalLabel', { defaultValue: 'Tạm tính' })}</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{t('shippingFee', { defaultValue: 'Phí vận chuyển' })}</span>
              <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>{t('discount', { defaultValue: 'Giảm giá' })}</span>
                <span className="font-medium">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg sm:text-xl font-bold pt-3 border-t">
              <span>{t('totalAmount', { defaultValue: 'Tổng cộng' })}</span>
              <span className="text-orange-500">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              {t('actions.contactSupport')}
            </button>
            {order.canBeCancelled && (
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                {t('actions.cancelOrder')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string, options?: Record<string, string>) => string }> = ({ error, onRetry, t }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">{t('error', { defaultValue: 'Đã xảy ra lỗi' })}</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
        {t('retry', { defaultValue: 'Thử lại' })}
      </button>
    </div>
  </div>
);

const NotFoundState: React.FC<{ t: (key: string, options?: Record<string, string>) => string }> = ({ t }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-400 text-6xl mb-4">📦</div>
      <h2 className="text-xl font-semibold mb-2">{t('notFound', { defaultValue: 'Không tìm thấy đơn hàng' })}</h2>
      <p className="text-gray-600 mb-4">{t('notFoundMessage', { defaultValue: 'Đơn hàng này không tồn tại hoặc đã bị xóa' })}</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        {t('backToOrders', { defaultValue: 'Quay lại đơn hàng' })}
      </button>
    </div>
  </div>
);