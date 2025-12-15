'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GetOrdersUseCase } from '@/domain/usecases/GetOrdersUseCase';
import { GetOrderStatisticsUseCase } from '@/domain/usecases/order/GetOrderStatisticsUseCase';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { OrderListFilters, OrderListResult, OrderStatistics } from '@/domain/repositories/IOrderRepository';

type FilterStatus = OrderStatus | 'ALL';

interface UseOrdersViewModelParams {
  getOrdersUseCase: GetOrdersUseCase;
  getOrderStatisticsUseCase: GetOrderStatisticsUseCase;
  initialFilters?: Partial<OrderListFilters>;
}

export const useOrdersViewModel = ({
  getOrdersUseCase,
  getOrderStatisticsUseCase,
  initialFilters,
}: UseOrdersViewModelParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrderListResult['pagination'] | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [filterStatus, setFilterStatusState] = useState<FilterStatus>('ALL');
  const [page, setPage] = useState(initialFilters?.page ?? 1);
  const [limit] = useState(initialFilters?.limit ?? 10);

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

      const result = await getOrdersUseCase.execute(filters);
      setOrders(result.orders);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, getOrdersUseCase, limit, page]);

  const loadStatistics = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      const statsResult = await getOrderStatisticsUseCase.execute();
      setOrderStats(statsResult);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to load statistics');
      console.error('Error loading order statistics:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [getOrderStatisticsUseCase]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const setFilterStatus = useCallback((status: FilterStatus) => {
    setFilterStatusState(status);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage < 1) return;
      if (pagination?.totalPages && nextPage > pagination.totalPages) return;
      setPage(nextPage);
    },
    [pagination?.totalPages]
  );

  const refresh = useCallback(async () => {
    await Promise.allSettled([loadOrders(), loadStatistics()]);
  }, [loadOrders, loadStatistics]);

  return {
    orders,
    pagination,
    orderStats,
    isLoading,
    isStatsLoading,
    error,
    statsError,
    filterStatus,
    setFilterStatus,
    pagination,
    handlePageChange,
    refresh,
  };
};
