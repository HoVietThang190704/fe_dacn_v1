import { useCallback } from 'react';
import { ORDER_CONFIG } from '../config/orderConfig';

export const useFormatCurrency = (locale: string) => {
  return useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: ORDER_CONFIG.DEFAULT_CURRENCY,
        maximumFractionDigits: ORDER_CONFIG.MAX_FRACTION_DIGITS,
      }).format(value),
    [locale]
  );
};

export default useFormatCurrency;
