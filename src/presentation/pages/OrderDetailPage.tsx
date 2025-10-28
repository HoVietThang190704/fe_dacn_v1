'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
// import { useOrderDetailViewModel } from '../viewmodels/useOrderDetailViewModel';
// import { container } from '../di/container';
import { OrderStatus } from '@/domain/entities/Order';

interface OrderDetailPageProps {
  orderId: string;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
  const t = useTranslations('order');
  // const viewModel = useOrderDetailViewModel(container.getOrderByIdUseCase, orderId);

  // Mock data for demo
  const mockOrder = {
    id: 'order-12345678',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    status: OrderStatus.CONFIRMED,
    totalAmount: 4.5,
    shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    items: [
      {
        productName: 'Táo Envy New Zealand - Hộp 1kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
        quantity: 2,
        price: 2.0,
      },
      {
        productName: 'Cam Úc nhập khẩu - Túi 1kg',
        image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        price: 1.5,
      },
      {
        productName: 'Nho xanh không hạt Úc - Hộp 500g',
        image: 'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        price: 1.0,
      },
    ],
  };

  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }

  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} t={t} />;
  // }

  // if (!viewModel.order) {
  //   return <NotFoundState t={t} />;
  // }

  // const order = viewModel.order;
  const order = mockOrder;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return t('pending');
      case OrderStatus.CONFIRMED:
        return t('confirmed');
      case OrderStatus.SHIPPING:
        return t('shipping');
      case OrderStatus.DELIVERED:
        return t('delivered');
      case OrderStatus.CANCELLED:
        return t('cancelled');
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {t('backToOrders')}
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('orderDetails')}</h1>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderNumber')}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">#{order.id.slice(-8)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('orderDate')}</h3>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('status')}</h3>
              <span className={`inline-flex px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('totalAmount')}</h3>
              <p className="text-base sm:text-lg font-semibold text-orange-500">
                ₫{(order.totalAmount * 20000).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t('shippingAddress')}</h3>
            <p className="text-gray-900 text-sm sm:text-base">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('items')}</h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    width={60}
                    height={60}
                    className="w-15 h-15 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1">{item.productName}</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span>{t('quantity')}: {item.quantity}</span>
                    <span>{t('price')}: ₫{(item.price * 20000).toLocaleString('vi-VN')}</span>
                    <span className="font-medium text-gray-900">
                      {t('subtotal')}: ₫{(item.price * item.quantity * 20000).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
              <span>{t('totalAmount')}</span>
              <span className="text-orange-500">
                ₫{(order.totalAmount * 20000).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
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
        </div>
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string) => string }> = ({ error, onRetry, t }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        {t('retry')}
      </button>
    </div>
  </div>
);

const NotFoundState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-400 text-6xl mb-4">📦</div>
      <h2 className="text-xl font-semibold mb-2">{t('notFound')}</h2>
      <p className="text-gray-600 mb-4">{t('notFoundMessage')}</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        {t('backToOrders')}
      </button>
    </div>
  </div>
);