import { useCallback, useState, useEffect } from 'react';
import { PRODUCT_CONFIG } from '@/presentation/config/productConfig';

export const useQuantity = (stockCount: number | undefined, initial = PRODUCT_CONFIG.MIN_QUANTITY) => {
  const [quantity, setQuantity] = useState<number>(initial);

  const increment = useCallback(() => {
    if (!stockCount) return;
    setQuantity((prev) => Math.min(stockCount, prev + 1));
  }, [stockCount]);

  const decrement = useCallback(() => {
    setQuantity((prev) => Math.max(PRODUCT_CONFIG.MIN_QUANTITY, prev - 1));
  }, []);

  const set = useCallback((value: number) => {
    if (!stockCount) return;
    setQuantity(Math.max(PRODUCT_CONFIG.MIN_QUANTITY, Math.min(stockCount, value)));
  }, [stockCount]);

  // make sure quantity doesn't exceed the stock count when stock changes
  useEffect(() => {
    if (typeof stockCount === 'number' && quantity > stockCount) setQuantity(stockCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockCount]);

  return {
    quantity,
    setQuantity: set,
    increment,
    decrement,
  };
};
