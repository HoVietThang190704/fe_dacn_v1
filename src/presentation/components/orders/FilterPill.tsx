'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';

export const FilterPill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  isLoading?: boolean;
}> = ({ label, active, onClick, count, isLoading }) => {
  const t = useTranslations('orders');
  return (
  <button
    onClick={onClick}
    className={`inline-flex snap-start items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1 sm:text-sm whitespace-nowrap ${
      active
        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
        : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <span>{label}</span>
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${
        active ? 'bg-white text-orange-600' : 'bg-white text-gray-600'
      }`}
    >
      {isLoading ? translateSafely(t, 'loading') : count ?? 0}
    </span>
  </button>
  );
};

export default FilterPill;
