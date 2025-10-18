/**
 * View Model: Orders Page
 * Manages state and business logic for orders page
 */
'use client';

import { useState, useEffect } from 'react';
import { GetOrdersUseCase } from '@/domain/usecases/GetOrdersUseCase';
import { Order, OrderStatus } from '@/domain/entities/Order';

export const useOrdersViewModel = (
  getOrdersUseCase: GetOrdersUseCase,
  userId: string
) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ordersData = await getOrdersUseCase.execute(userId);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    confirmed: orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
    shipping: orders.filter(o => o.status === OrderStatus.SHIPPING).length,
    delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
  };

  return {
    orders: filteredOrders,
    isLoading,
    error,
    filterStatus,
    orderStats,
    setFilterStatus,
    refresh: loadOrders,
  };
};
