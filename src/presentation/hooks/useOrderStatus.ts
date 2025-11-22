import { useCallback } from 'react';
import { ORDER_STATUS, OrderStatus } from '@/domain/entities/Order';

export const useOrderStatus = () => {
  const getStatusColor = useCallback((status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ORDER_STATUS.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case ORDER_STATUS.PREPARING:
        return 'bg-indigo-100 text-indigo-800';
      case ORDER_STATUS.SHIPPING:
        return 'bg-purple-100 text-purple-800';
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ORDER_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ORDER_STATUS.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return { getStatusColor };
};

export default useOrderStatus;
