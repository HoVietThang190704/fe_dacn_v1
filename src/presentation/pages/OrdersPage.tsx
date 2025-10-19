'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { container } from '../di/container';
import { Order, OrderStatus } from '@/domain/entities/Order';

interface OrdersPageProps {
  userId: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ userId }) => {
  const t = useTranslations('orders');
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useOrdersViewModel(container.getOrdersUseCase, userId);
  // if (viewModel.isLoading) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  const mockOrders = [
    {
      id: 'ODR12345678',
      userId: userId,
      status: OrderStatus.SHIPPING,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalAmount: 450000,
      items: [
        {
          productId: 'PR001',
          productName: 'Cà chua Đà Lạt tươi ngon',
          image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
          quantity: 2,
          price: 35000
        },
        {
          productId: 'PR002',
          productName: 'Dưa hấu không hạt Mỹ',
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784l66?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          price: 120000
        },
        {
          productId: 'PR003',
          productName: 'Rau xà lách hữu cơ',
          image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80',
          quantity: 3,
          price: 25000
        }
      ],
      shippingAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM'
    },
    {
      id: 'ODR87654321',
      userId: userId,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 43200000),
      totalAmount: 280000,
      items: [
        {
          productId: 'PR004',
          productName: 'Táo Envy New Zealand',
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
          quantity: 2,
          price: 85000
        },
        {
          productId: 'PR005',
          productName: 'Nho xanh không hạt Úc',
          image: 'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=400&q=80',
          quantity: 1,
          price: 110000
        }
      ],
      shippingAddress: '456 Lê Văn Việt, Quận 9, TP.HCM'
    },
    {
      id: 'ODR13579246',
      userId: userId,
      status: OrderStatus.PENDING,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      totalAmount: 195000,
      items: [
        {
          productId: 'PR006',
          productName: 'Cam sành Cao Phong',
          image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
          quantity: 5,
          price: 39000
        }
      ],
      shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM'
    }
  ];

  const mockOrderStats = {
    total: 2,
    pending: 1,
    confirmed: 0,
    shipping: 0,
    delivered: 1,
    cancelled: 0
  };

  const [filterStatus, setFilterStatus] = React.useState<OrderStatus | 'ALL'>('ALL');
  const filteredOrders =
    filterStatus === 'ALL'
      ? mockOrders
      : mockOrders.filter((order) => order.status === filterStatus);

  return (
    <section className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
      </div>
      <div className="bg-white shadow-sm lg:text-3xl mb-3 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-4 px-2 sm:px-0">
          <FilterButton label={t('filter.all')} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
          <FilterButton label={t('filter.pending')} active={filterStatus === OrderStatus.PENDING} onClick={() => setFilterStatus(OrderStatus.PENDING)} />
          <FilterButton label={t('filter.shipping')} active={filterStatus === OrderStatus.SHIPPING} onClick={() => setFilterStatus(OrderStatus.SHIPPING)} />
          <FilterButton label={t('filter.delivered')} active={filterStatus === OrderStatus.DELIVERED} onClick={() => setFilterStatus(OrderStatus.DELIVERED)} />
          <FilterButton label={t('filter.cancelled')} active={filterStatus === OrderStatus.CANCELLED} onClick={() => setFilterStatus(OrderStatus.CANCELLED)} />
        </div>
      </div>
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <EmptyState filterStatus={filterStatus} />
        )}
      </div>
    </section>
  );
};

const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-2 py-2 text-xs sm:px-4 sm:py-3 lg:px-5 lg:py-3 lg:text-lg sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
      active
        ? 'border-orange-500 text-orange-500'
        : 'border-transparent text-gray-600 hover:text-orange-500'
    }`}
  >
    {label}
  </button>
);

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const t = require('next-intl').useTranslations('orders');

  const statusColors = {
    [OrderStatus.PENDING]: 'text-orange-500',
    [OrderStatus.CONFIRMED]: 'text-blue-500',
    [OrderStatus.SHIPPING]: 'text-green-500',
    [OrderStatus.DELIVERED]: 'text-gray-500',
    [OrderStatus.CANCELLED]: 'text-red-500',
  };

  const statusLabels = {
    [OrderStatus.PENDING]: t('filter.pending'),
    [OrderStatus.CONFIRMED]: t('actions.confirmed') || 'Confirmed',
    [OrderStatus.SHIPPING]: t('filter.shipping'),
    [OrderStatus.DELIVERED]: t('filter.delivered'),
    [OrderStatus.CANCELLED]: t('filter.cancelled'),
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
          </svg>
          <span className="font-medium text-sm">Fresh Market</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
      </div>
      <div className="p-4">
        {order.items.map((item, index) => (
          <div key={index} className={`flex gap-3 ${index > 0 ? 'mt-3 pt-3 border-t' : ''}`}>
            <img
              src={item.image}
              alt={item.productName}
              className="w-20 h-20 object-cover border rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-normal line-clamp-2 mb-1">{item.productName}</h4>
              <p className="text-xs text-gray-500">x{item.quantity}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm text-gray-400 line-through">
                ₫{(item.price * 1.2).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm font-medium text-orange-500">
                ₫{item.price.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{t('amountLabel')}</span>
          <div className="text-right">
            <span className="text-lg font-medium text-orange-500">
              ₫{order.totalAmount.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          {order.status === OrderStatus.DELIVERED && (
            <>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors">{t('actions.review')}</button>
              <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">{t('actions.buyAgain')}</button>
            </>
          )}
          {order.status === OrderStatus.SHIPPING && (
            <>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors">{t('actions.contactSeller')}</button>
              <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">{t('actions.confirmReceived')}</button>
            </>
          )}
          {order.status === OrderStatus.PENDING && (
            <>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors">{t('actions.cancel')}</button>
              <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">{t('actions.details')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

  const LoadingState = () => {
    const t = require('next-intl').useTranslations('orders');
    return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{t('loading') || 'Loading orders...'}</p>
    </div>
  </div>
    );
  };

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  const t = require('next-intl').useTranslations('orders');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">{t('errorTitle') || 'An error occurred'}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={onRetry} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{t('retry') || 'Retry'}</button>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ filterStatus: OrderStatus | 'ALL' }> = ({ filterStatus }) => {
  const t = require('next-intl').useTranslations('orders');
  return (
    <div className="text-center py-12 bg-white rounded-lg">
      <div className="text-gray-400 text-6xl mb-4">📦</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{filterStatus === 'ALL' ? t('noOrders') : t('noOrders')}</h3>
      <p className="text-gray-500 mb-6">{filterStatus === 'ALL' ? t('startShopping') : t('startShopping')}</p>
      {filterStatus === 'ALL' && <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{t('startShopping')}</button>}
    </div>
  );
};
