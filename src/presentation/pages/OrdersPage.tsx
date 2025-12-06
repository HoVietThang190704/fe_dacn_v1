'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS, OrderStatus } from '@/domain/entities/Order';
import { ORDER_CONFIG } from '../config/orderConfig';
import OrdersHeader from '../components/orders/OrdersHeader';
import FilterPill from '../components/orders/FilterPill';
import OrderCard from '../components/orders/OrderCard';
import OrdersLoadingState from '../components/orders/LoadingState';
import OrdersErrorState from '../components/orders/ErrorState';
import OrdersEmptyState from '../components/orders/EmptyState';
import { container } from '../di/container';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { CancelOrderDialog } from '../components/CancelOrderDialog';

type FilterStatus = OrderStatus | 'ALL';

 

export const OrdersPage = () => {
  const t = useTranslations('orders');
  const router = useRouter();
  const locale = useLocale();
  const { cancelOrder, isLoading: isCancelling, error: cancelError } = useCancelOrder();
  
  const [cancelDialogState, setCancelDialogState] = useState<{
    isOpen: boolean;
    orderId: string | null;
    orderNumber: string | null;
  }>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getOrdersUseCase = container.getOrdersUseCase;
  const getOrderStatisticsUseCase = container.getOrderStatisticsUseCase;

  const title = t('title');
  const subtitle = t('subtitle');
  const filterLabelAll = t('filter.all');
  const filterLabelPending = t('filter.pending');
  const filterLabelConfirmed = t('filter.confirmed');
  const filterLabelPreparing = t('filter.preparing');
  const filterLabelShipping = t('filter.shipping');
  const filterLabelDelivered = t('filter.delivered');
  const filterLabelCancelled = t('filter.cancelled');

  const {
    orders,
    orderStats,
    isLoading,
    isStatsLoading,
    error,
    statsError,
    filterStatus,
    setFilterStatus,
    refresh,
  } = useOrdersViewModel({
    getOrdersUseCase,
    getOrderStatisticsUseCase,
    initialFilters: { limit: ORDER_CONFIG.DEFAULT_PAGE_LIMIT },
  });

  const filterOptions = useMemo(
    () => [
      { key: 'ALL' as FilterStatus, label: filterLabelAll, count: orderStats?.total ?? 0 },
      { key: ORDER_STATUS.PENDING, label: filterLabelPending, count: orderStats?.pending ?? 0 },
      { key: ORDER_STATUS.CONFIRMED, label: filterLabelConfirmed, count: orderStats?.confirmed ?? 0 },
      { key: ORDER_STATUS.PREPARING, label: filterLabelPreparing, count: orderStats?.preparing ?? 0 },
      { key: ORDER_STATUS.SHIPPING, label: filterLabelShipping, count: orderStats?.shipping ?? 0 },
      { key: ORDER_STATUS.DELIVERED, label: filterLabelDelivered, count: orderStats?.delivered ?? 0 },
      { key: ORDER_STATUS.CANCELLED, label: filterLabelCancelled, count: orderStats?.cancelled ?? 0 },
    ],
    [
      filterLabelAll,
      filterLabelPending,
      filterLabelConfirmed,
      filterLabelPreparing,
      filterLabelShipping,
      filterLabelDelivered,
      filterLabelCancelled,
      orderStats,
    ]
  );

  const handleFilterChange = useCallback(
    (status: FilterStatus) => {
      setFilterStatus(status);
    },
    [setFilterStatus]
  );

  const handleOpenCancelDialog = (orderId: string, orderNumber: string) => {
    setCancelDialogState({
      isOpen: true,
      orderId,
      orderNumber,
    });
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogState({
      isOpen: false,
      orderId: null,
      orderNumber: null,
    });
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelDialogState.orderId) return;
    
    try {
      await cancelOrder(cancelDialogState.orderId, reason);
      const successMsg = t('success.cancelledSuccessfully');
      setSuccessMessage(successMsg);
      handleCloseCancelDialog();
      refresh();
      
      setTimeout(() => setSuccessMessage(null), ORDER_CONFIG.SUCCESS_MESSAGE_DURATION);
    } catch {}
  };

  const isInitialLoading = isLoading && orders.length === 0;

  if (isInitialLoading) return <OrdersLoadingState />;
  if (error && orders.length === 0) return <OrdersErrorState error={error} onRetry={refresh} />;

  return (
    <section className="min-h-screen bg-gray-50 px-3 pb-8 pt-4 sm:px-6 lg:px-10">
      
      <OrdersHeader
        title={title}
        subtitle={subtitle}
        statsError={statsError}
        isStatsLoading={isStatsLoading}
        onRefresh={refresh}
        successMessage={successMessage}
        onCloseSuccess={() => setSuccessMessage(null)}
      />

      <nav className="sticky top-0 z-20 mb-6 border-y border-gray-200 bg-white/95 backdrop-blur mx-0 sm:mx-0 sm:rounded-2xl sm:border overflow-hidden">
  <div className="flex flex-wrap gap-2 px-3 py-3 sm:flex-nowrap sm:snap-x sm:snap-mandatory sm:gap-2 sm:overflow-x-auto sm:px-4">
          {filterOptions.map((option) => (
            <FilterPill key={option.key} label={option.label} active={filterStatus === option.key} onClick={() => handleFilterChange(option.key)} count={option.count} isLoading={isStatsLoading} />
          ))}
        </div>
      </nav>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} onViewDetail={() => router.push(`/main/orders/${order.id}`)} onCancel={() => handleOpenCancelDialog(order.id, order.orderNumber)} />
          ))
        ) : (
          <OrdersEmptyState filterStatus={filterStatus} />
        )}
      </div>

      <CancelOrderDialog
        isOpen={cancelDialogState.isOpen}
        orderNumber={cancelDialogState.orderNumber || ''}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseCancelDialog}
        error={cancelError}
      />
    </section>
  );
};

 
