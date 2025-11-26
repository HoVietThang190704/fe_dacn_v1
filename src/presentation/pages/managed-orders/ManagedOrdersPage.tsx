"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';

import { container } from '../../di/container';
import { useManagedOrdersViewModel, ManagedOrderFilterStatus } from '../../viewmodels/useManagedOrdersViewModel';
import { ORDER_STATUS, Order, OrderStatus } from '@/domain/entities/Order';
import { OrderRow } from './OrderRow';
import ManagedOrdersHeader from './components/ManagedOrdersHeader';
import ManagedOrdersToolbar from './components/ManagedOrdersToolbar';
import Icon from '@/presentation/components/ui/Icon';
import { DEFAULT_MANAGED_ORDER_LIMIT } from './constants';

export const ManagedOrdersPage = () => {
  const router = useRouter();
  const t = useTranslations('orders');

  const getManagedOrdersUseCase = container.getManagedOrdersUseCase;
  const getManagedOrderByIdUseCase = container.getManagedOrderByIdUseCase;
  const updateManagedOrderStatusUseCase = container.updateManagedOrderStatusUseCase;

  const {
    orders,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    isLoading,
    error,
    refresh,
    updateOrderStatus,
    updatingOrderId,
    updateError,
    successMessage,
    setSuccessMessage,
  } = useManagedOrdersViewModel({
    getManagedOrdersUseCase,
    updateManagedOrderStatusUseCase,
    initialFilters: { limit: DEFAULT_MANAGED_ORDER_LIMIT },
  });

  const [searchInput, setSearchInput] = useState<string>(search);
  const [statusDraft, setStatusDraft] = useState<Record<string, OrderStatus>>({});

  useEffect(() => setSearchInput(search), [search]);

  useEffect(() => {
    setStatusDraft((prev) => {
      const next = { ...prev };
      let changed = false;
      const orderIds = new Set<string>();

      orders.forEach((order) => {
        orderIds.add(order.id);
        if (!Object.prototype.hasOwnProperty.call(next, order.id)) {
          next[order.id] = order.status;
          changed = true;
        }
      });

      Object.keys(next).forEach((orderId) => {
        if (!orderIds.has(orderId)) {
          delete next[orderId];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [orders]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleStatusSelect = (value: ManagedOrderFilterStatus) => setFilterStatus(value);
  const handleStatusDraftChange = (orderId: string, status: OrderStatus) => setStatusDraft((prev) => ({ ...prev, [orderId]: status }));

  const handleUpdateStatus = async (order: Order) => {
    const nextStatus = statusDraft[order.id];
    if (!nextStatus || nextStatus === order.status) return;

    await updateOrderStatus(order.id, {
      status: nextStatus,
      trackingNumber: order.trackingNumber ?? undefined,
    });
  };

  const statusOptions = useMemo(
    () => Object.values(ORDER_STATUS).map((status) => ({ value: status, label: t(`status.${status.toLowerCase()}`) })),
    [t]
  );

  const handleViewDetail = async (orderId: string) => {
    await getManagedOrderByIdUseCase.execute(orderId);
    router.push(`/main/orders/${orderId}`);
  };

  const closeSuccess = () => setSuccessMessage(null);
  const retry = () => refresh();

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-10 pt-6 sm:px-8 lg:px-12">
      <ManagedOrdersHeader t={t} isLoading={isLoading} onRefresh={refresh} successMessage={successMessage ?? null} onCloseSuccess={closeSuccess} />

      <ManagedOrdersToolbar t={t} searchInput={searchInput} setSearchInput={setSearchInput} onSubmitSearch={handleSearchSubmit} filterStatus={filterStatus} setFilterStatus={handleStatusSelect} limit={limit} setLimit={setLimit} pagination={pagination} />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Icon name="WARNING" alt={t('dialog.warningAlt', { defaultValue: 'Cảnh báo' })} width={18} height={18} />
              <span>{translateSafely(t, error ?? '', error ?? '')}</span>
            </div>
            <button type="button" className="text-red-700 underline-offset-2 hover:underline" onClick={retry}>
              {t('retry', { defaultValue: 'Thử lại' })}
            </button>
          </div>
        </div>
      )}

      {updateError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <Icon name="WARNING" alt={t('dialog.warningAlt', { defaultValue: 'Cảnh báo' })} width={18} height={18} />
            <span>{translateSafely(t, updateError ?? '', updateError ?? '')}</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('orderNumber', { defaultValue: 'Mã đơn' })}</th>
                <th className="px-4 py-3">{t('labels.customer', { defaultValue: 'Khách hàng' })}</th>
                <th className="px-4 py-3">{t('amountLabel', { defaultValue: 'Tổng tiền' })}</th>
                <th className="px-4 py-3">{t('paymentMethod', { defaultValue: 'Thanh toán' })}</th>
                <th className="px-4 py-3">{t('statusLabel', { defaultValue: 'Trạng thái' })}</th>
                <th className="px-4 py-3">{t('orderDate', { defaultValue: 'Ngày tạo' })}</th>
                <th className="px-4 py-3">{t('actionsLabel', { defaultValue: 'Thao tác' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    {t('loading', { defaultValue: 'Đang tải danh sách đơn hàng...' })}
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} statusOptions={statusOptions} statusDraft={statusDraft[order.id] ?? order.status} updating={updatingOrderId === order.id} onStatusChange={handleStatusDraftChange} onUpdateStatus={handleUpdateStatus} onViewDetail={handleViewDetail} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    {t('noOrdersInFilter')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-gray-600 sm:flex-row">
          <div>
            {t('paginationInfo', { page, totalPages: pagination.totalPages, total: pagination.total })}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Icon name="ARROW_LEFT" width={16} height={16} alt={t('prevPage', { defaultValue: 'Trước' })} />
            </button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={pagination && page >= pagination.totalPages} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Icon name="ARROW_RIGHT" width={16} height={16} alt={t('nextPage', { defaultValue: 'Sau' })} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

