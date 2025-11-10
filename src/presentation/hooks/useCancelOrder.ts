import { useState } from 'react';
import { container } from '../di/container';

interface UseCancelOrderResult {
  isLoading: boolean;
  error: string | null;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
}

export const useCancelOrder = (): UseCancelOrderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelOrderUseCase = container.cancelOrderUseCase;

  const cancelOrder = async (orderId: string, reason: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!reason || reason.trim().length === 0) {
        throw new Error('Vui lòng nhập lý do hủy đơn');
      }

      await cancelOrderUseCase.execute(orderId, reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể hủy đơn hàng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    cancelOrder,
  };
};
