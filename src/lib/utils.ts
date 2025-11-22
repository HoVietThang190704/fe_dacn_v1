import { useMemo } from 'react';
import { useLocale } from 'next-intl';

export const useFormatCurrency = () => {
  const locale = useLocale();
  return useMemo<(value: number) => string>(
    () =>
      (value: number) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(value),
    [locale]
  );
};

export const getInitials = (name = ''): string => {
  return (name || '')
    .split(' ')
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
};