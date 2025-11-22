'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS, OrderStatus } from '@/domain/entities/Order';
import { ORDER_CONFIG } from '../config/orderConfig';
import { translateSafely } from '../utils/translate';
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

  const title = translateSafely(t, 'title', 'Đơn hàng của bạn');
  const subtitle = translateSafely(t, 'subtitle', 'Theo dõi trạng thái và quản lý đơn hàng gần đây.');
  const refreshLabel = translateSafely(t, 'actions.refresh', 'Làm mới');
  const filterLabelAll = translateSafely(t, 'filter.all', 'Tất cả');
  const filterLabelPending = translateSafely(t, 'filter.pending', 'Chờ xác nhận');
  const filterLabelConfirmed = translateSafely(t, 'filter.confirmed', 'Đã xác nhận');
  const filterLabelPreparing = translateSafely(t, 'filter.preparing', 'Đang chuẩn bị');
  const filterLabelShipping = translateSafely(t, 'filter.shipping', 'Đang giao');
  const filterLabelDelivered = translateSafely(t, 'filter.delivered', 'Đã giao');
  const filterLabelCancelled = translateSafely(t, 'filter.cancelled', 'Đã hủy');

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
      const successMsg = translateSafely(t, 'success.cancelledSuccessfully', 'Hủy đơn hàng thành công');
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
      
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500 md:text-base">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {statsError && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
              {statsError}
            </span>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4 4v3h.01L4 7a6 6 0 111.757 4.242l1.415-1.414A4 4 0 104 7h3V4H4z" />
            </svg>
            {refreshLabel}
          </button>
        </div>
      </header>

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

 
