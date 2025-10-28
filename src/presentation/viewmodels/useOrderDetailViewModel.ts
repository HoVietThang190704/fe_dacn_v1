'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetOrderByIdUseCase } from '@/domain/usecases/GetOrderByIdUseCase';
import { Order } from '@/domain/entities/Order';

export const useOrderDetailViewModel = (getOrderByIdUseCase: GetOrderByIdUseCase, orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await getOrderByIdUseCase.execute(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
      console.error('Error loading order:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getOrderByIdUseCase, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  return {
    order,
    isLoading,
    error,
    refresh: loadOrder,
  };
};