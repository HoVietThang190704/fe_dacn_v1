'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { container } from '../../di/container';
import { useManagedOrdersViewModel, ManagedOrderFilterStatus } from '../../viewmodels/useManagedOrdersViewModel';
import { ORDER_STATUS, Order, OrderStatus } from '@/domain/entities/Order';
import { OrderRow } from './OrderRow';
import { getFilterOptions, PAGE_SIZES, DEFAULT_MANAGED_ORDER_LIMIT } from './constants';

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
      {successMessage && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span aria-hidden>✅</span>
              <span>{successMessage}</span>
            </div>
            <button type="button" onClick={closeSuccess} className="text-emerald-700 hover:text-emerald-900">
              {t('actions.close', { defaultValue: 'Đóng' })}
            </button>
          </div>
        </div>
      )}

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">{t('title') || 'Quản lý đơn hàng'}</h1>
          <p className="mt-1 text-sm text-gray-500 lg:text-base">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-md border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition hover:bg-orange-50"
            disabled={isLoading}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4 4v3h.01L4 7a6 6 0 111.757 4.242l1.415-1.414A4 4 0 104 7h3V4H4z" />
            </svg>
            {t('actions.refresh')}
          </button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[2fr_1fr] lg:items-center">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('searchPlaceholder', { defaultValue: 'Tìm theo mã đơn, khách hàng, số điện thoại...' })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">🔍</span>
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
            {t('actions.search', { defaultValue: 'Tìm kiếm' })}
          </button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            {t('filterTitle', { defaultValue: 'Bộ lọc trạng thái' })}
            <select
              value={filterStatus}
              onChange={(event) => handleStatusSelect(event.target.value as ManagedOrderFilterStatus)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {getFilterOptions(t).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {pagination && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              {t('eachPage', { defaultValue: 'Mỗi trang' })}
              <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200">
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span aria-hidden>⚠️</span>
              <span>{error}</span>
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
            <span aria-hidden>⚠️</span>
            <span>{updateError}</span>
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
              {t('prevPage', { defaultValue: 'Trước' })}
            </button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={pagination && page >= pagination.totalPages} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
              {t('nextPage', { defaultValue: 'Sau' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

