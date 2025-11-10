'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS, Order, OrderStatus, PaymentMethod } from '@/domain/entities/Order';
import { container } from '../di/container';
import { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { CancelOrderDialog } from '../components/CancelOrderDialog';

type FilterStatus = OrderStatus | 'ALL';

const FALLBACK_IMAGE = '/img/Background.png';

const paymentLabels: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery',
  momo: 'MoMo Wallet',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
  card: 'Bank Card',
};

const translateSafely = (translate: (key: string) => string, key: string, fallback: string) => {
  try {
    const value = translate(key);
    return !value || value === key ? fallback : value;
  } catch {
    return fallback;
  }
};

type TranslationValues = Record<string, string | number | Date>;

const translateWithValues = (
  translate: (key: string, values?: TranslationValues) => string,
  key: string,
  values: TranslationValues,
  fallback: string
) => {
  try {
    const value = translate(key, values);
    return !value || value === key ? fallback : value;
  } catch {
    return fallback;
  }
};

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
    initialFilters: { limit: 10 },
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
      // Refresh orders list
      refresh();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error is handled by the dialog via cancelError
    }
  };

  const isInitialLoading = isLoading && orders.length === 0;

  if (isInitialLoading) {
    return <LoadingState />;
  }

  if (error && orders.length === 0) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <section className="min-h-screen bg-gray-50 px-3 pb-8 pt-4 sm:px-6 lg:px-10">
      {/* Success Toast */}
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

      <nav className="sticky top-0 z-20 -mx-3 mb-6 border-y border-gray-200 bg-white/95 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 py-3 sm:px-4">
          {filterOptions.map((option) => (
            <FilterPill
              key={option.key}
              label={option.label}
              active={filterStatus === option.key}
              onClick={() => handleFilterChange(option.key)}
              count={option.count}
              isLoading={isStatsLoading}
            />
          ))}
        </div>
      </nav>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              locale={locale}
              onViewDetail={() => router.push(`/main/orders/${order.id}`)}
              onCancel={() => handleOpenCancelDialog(order.id, order.orderNumber)}
            />
          ))
        ) : (
          <EmptyState filterStatus={filterStatus} />
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

const FilterPill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  isLoading?: boolean;
}> = ({ label, active, onClick, count, isLoading }) => (
  <button
    onClick={onClick}
    className={`flex snap-start items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
      active
        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
        : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <span>{label}</span>
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${
        active ? 'bg-white text-orange-600' : 'bg-white text-gray-600'
      }`}
    >
      {isLoading ? '…' : count ?? 0}
    </span>
  </button>
);

const statusStyles: Record<OrderStatus, { labelKey: string; bg: string; text: string }> = {
  [ORDER_STATUS.PENDING]: { labelKey: 'status.pending', bg: 'bg-orange-50', text: 'text-orange-600' },
  [ORDER_STATUS.CONFIRMED]: { labelKey: 'status.confirmed', bg: 'bg-blue-50', text: 'text-blue-600' },
  [ORDER_STATUS.PREPARING]: { labelKey: 'status.preparing', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  [ORDER_STATUS.SHIPPING]: { labelKey: 'status.shipping', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  [ORDER_STATUS.DELIVERED]: { labelKey: 'status.delivered', bg: 'bg-gray-100', text: 'text-gray-700' },
  [ORDER_STATUS.CANCELLED]: { labelKey: 'status.cancelled', bg: 'bg-red-50', text: 'text-red-600' },
  [ORDER_STATUS.REFUNDED]: { labelKey: 'status.refunded', bg: 'bg-purple-50', text: 'text-purple-600' },
};

const OrderCard: React.FC<{ order: Order; onViewDetail: () => void; onCancel: () => void; locale: string }> = ({ order, onViewDetail, onCancel, locale }) => {
  const t = useTranslations('orders');
  const leadItem = order.items[0];
  const remainingItems = Math.max(0, order.totalItems - 1);
  const createdAtDisplay = order.createdAt ? new Date(order.createdAt).toLocaleString(locale) : '';

  const statusVariant = statusStyles[order.status];
  const statusLabel = translateSafely(t, statusVariant?.labelKey ?? order.status, order.statusDisplay ?? order.status);

  const paymentLabel = translateSafely(
    t,
    `payment.${order.paymentMethod}`,
    paymentLabels[order.paymentMethod] ?? order.paymentMethod
  );

  const shippingAddress = order.shippingAddress?.fullAddress;
  const estimatedDelivery = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString(locale)
    : undefined;
  const estimatedLabel = estimatedDelivery
    ? translateWithValues(t, 'labels.estimatedDelivery', { date: estimatedDelivery }, estimatedDelivery)
    : undefined;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);

  const amountBreakdown = translateWithValues(
    t,
    'amountBreakdown',
    {
      subtotal: formatCurrency(order.subtotal),
      shipping: formatCurrency(order.shippingFee),
      discount: formatCurrency(order.discount),
    },
    `Tạm tính ${formatCurrency(order.subtotal)} · Ship ${formatCurrency(order.shippingFee)} · Giảm ${formatCurrency(order.discount)}`
  );
  const cancelReason = order.cancelReason
    ? translateWithValues(t, 'labels.cancelReason', { reason: order.cancelReason }, order.cancelReason)
    : undefined;

  const cancellableStatuses: OrderStatus[] = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
  ];

  return (
    <article className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 sm:text-base">#{order.orderNumber}</p>
          <p className="text-xs text-gray-500 sm:text-sm">{createdAtDisplay}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${statusVariant?.bg ?? 'bg-gray-100'} ${
            statusVariant?.text ?? 'text-gray-700'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-20">
            {leadItem ? (
              <Image
                src={leadItem.productImage || FALLBACK_IMAGE}
                alt={leadItem.productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">📦</div>
            )}
            {remainingItems > 0 && (
              <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                +{remainingItems}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-gray-900 sm:text-base">
              {leadItem?.productName ?? translateSafely(t, 'labels.noProduct', 'Sản phẩm không xác định')}
            </p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {leadItem ? `x${leadItem.quantity}` : ''}
              {remainingItems > 0 && ` · ${order.totalItems} sản phẩm`}
            </p>
            {order.note && (
              <p className="mt-1 truncate text-xs text-gray-400">{order.note}</p>
            )}
          </div>
        </div>

        <div className="flex flex-none flex-col items-start gap-2 text-sm text-gray-500 sm:items-end">
          <div className="text-xs uppercase tracking-wide text-gray-400">{translateSafely(t, 'labels.total', 'Tổng cộng')}</div>
          <div className="text-lg font-semibold text-orange-500 sm:text-xl">{formatCurrency(order.total)}</div>
          <p className="text-xs text-gray-400 sm:text-sm">{amountBreakdown}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onViewDetail}
              className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-600 sm:text-sm"
            >
              {translateSafely(t, 'actions.details', 'Xem chi tiết')}
            </button>
            {order.canBeCancelled && cancellableStatuses.includes(order.status) && (
              <button
                onClick={onCancel}
                className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:text-sm"
              >
                {translateSafely(t, 'actions.cancel', 'Hủy đơn')}
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-6 sm:text-sm">
        {shippingAddress && (
          <div className="flex items-start gap-2">
            <span aria-hidden>📍</span>
            <span className="line-clamp-2 sm:line-clamp-1">{shippingAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span aria-hidden>💳</span>
          <span>{paymentLabel}</span>
        </div>
        {estimatedLabel && (
          <div className="flex items-center gap-2">
            <span aria-hidden>🗓</span>
            <span>{estimatedLabel}</span>
          </div>
        )}
        {order.status === ORDER_STATUS.CANCELLED && cancelReason && (
          <div className="flex items-center gap-2 text-red-500">
            <span aria-hidden>⚠️</span>
            <span>{cancelReason}</span>
          </div>
        )}
      </footer>
    </article>
  );
};

const LoadingState = () => {
  const t = useTranslations('orders');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-sm text-gray-600">
          {translateSafely(t, 'loading', 'Đang tải đơn hàng...')}
        </p>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  const t = useTranslations('orders');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900">
          {translateSafely(t, 'errorTitle', 'Có lỗi xảy ra')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          {translateSafely(t, 'retry', 'Thử lại')}
        </button>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ filterStatus: FilterStatus }> = ({ filterStatus }) => {
  const t = useTranslations('orders');
  const isAll = filterStatus === 'ALL';
  const heading = isAll
    ? translateSafely(t, 'noOrders', 'Bạn chưa có đơn hàng nào')
    : translateSafely(t, 'noOrdersInFilter', 'Không có đơn phù hợp với bộ lọc');
  const body = isAll
    ? translateSafely(t, 'startShopping', 'Khám phá sản phẩm và đặt hàng ngay hôm nay')
    : translateSafely(t, 'emptyFilterHint', 'Hãy thử bộ lọc khác hoặc quay lại sau.');

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">📦</div>
      <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{heading}</h3>
      <p className="mt-2 text-sm text-gray-500 sm:text-base">{body}</p>
      {isAll && (
        <button className="mt-5 inline-flex items-center rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
          {translateSafely(t, 'startShoppingCta', 'Bắt đầu mua sắm')}
        </button>
      )}
    </div>
  );
};
