import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { ORDER_CONFIG } from '@/presentation/config/orderConfig';

export const useCurrency = () => {
  const locale = useLocale();

  const format = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: ORDER_CONFIG.DEFAULT_CURRENCY,
        maximumFractionDigits: ORDER_CONFIG.MAX_FRACTION_DIGITS,
      }).format(value),
    [locale]
  );

  return { formatCurrency: format };
};

export default useCurrency;
