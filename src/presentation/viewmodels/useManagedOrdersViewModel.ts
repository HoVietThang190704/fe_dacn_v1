'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { GetManagedOrdersUseCase } from '@/domain/usecases/order/GetManagedOrdersUseCase';
import { UpdateManagedOrderStatusUseCase } from '@/domain/usecases/order/UpdateManagedOrderStatusUseCase';
import {
  OrderListFilters,
  OrderListResult,
  UpdateManagedOrderStatusRequest,
} from '@/domain/repositories/IOrderRepository';

export type ManagedOrderFilterStatus = OrderStatus | 'ALL';

type UseManagedOrdersParams = {
  getManagedOrdersUseCase: GetManagedOrdersUseCase;
  updateManagedOrderStatusUseCase: UpdateManagedOrderStatusUseCase;
  initialFilters?: Partial<OrderListFilters>;
};

export const useManagedOrdersViewModel = ({
  getManagedOrdersUseCase,
  updateManagedOrderStatusUseCase,
  initialFilters,
}: UseManagedOrdersParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrderListResult['pagination'] | null>(null);
  const [page, setPage] = useState(initialFilters?.page ?? 1);
  const [limit, setLimit] = useState(initialFilters?.limit ?? 10);
  const [filterStatus, setFilterStatus] = useState<ManagedOrderFilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: OrderListFilters = {
        page,
        limit,
      };

      if (filterStatus !== 'ALL') {
        filters.status = filterStatus;
      }

      if (search.trim().length > 0) {
        filters.search = search.trim();
      }

      const result = await getManagedOrdersUseCase.execute(filters);
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng';
      setError(message);
      console.error('[useManagedOrdersViewModel] load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, search, getManagedOrdersUseCase, limit, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(initialFilters?.page ?? 1);
    setLimit(initialFilters?.limit ?? 10);
  }, [initialFilters?.limit, initialFilters?.page]);

  const refresh = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  const changeFilterStatus = useCallback((status: ManagedOrderFilterStatus) => {
    setFilterStatus(status);
    setPage(1);
  }, []);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const changeLimit = useCallback((value: number) => {
    setLimit(value);
    setPage(1);
  }, []);

  const changePage = useCallback((value: number) => {
    setPage(Math.max(1, value));
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, payload: UpdateManagedOrderStatusRequest) => {
      try {
        setUpdatingOrderId(orderId);
        setUpdateError(null);
        const updated = await updateManagedOrderStatusUseCase.execute(orderId, payload);
        setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
        setSuccessMessage('Cập nhật trạng thái đơn hàng thành công');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái đơn hàng';
        setUpdateError(message);
        console.error('[useManagedOrdersViewModel] update status error:', err);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [updateManagedOrderStatusUseCase]
  );

  return {
    orders,
    pagination,
    page,
    setPage: changePage,
    limit,
    setLimit: changeLimit,
    filterStatus,
    setFilterStatus: changeFilterStatus,
    search,
    setSearch: changeSearch,
    isLoading,
    error,
    updateError,
    updatingOrderId,
    successMessage,
    setSuccessMessage,
    refresh,
    updateOrderStatus,
  };
};
