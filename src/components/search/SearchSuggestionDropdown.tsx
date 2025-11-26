'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ProductSuggestion } from '@/lib/api';

const formatPrice = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ₫`;
  }
};

interface SearchSuggestionDropdownProps {
  visible: boolean;
  suggestions: ProductSuggestion[];
  isLoading: boolean;
  query: string;
  onSelect: (item: ProductSuggestion) => void;
  onViewAll: () => void;
}

export const SearchSuggestionDropdown: React.FC<SearchSuggestionDropdownProps> = ({
  visible,
  suggestions,
  isLoading,
  query,
  onSelect,
  onViewAll
}) => {
  const t = useTranslations('searchSuggestions');

  if (!visible) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 overflow-hidden">
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
            <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden />
            {t('loading')}
          </div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">{t('empty')}</p>
        )}

        {!isLoading && suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item)}
          >
            {item.image ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-100 text-xs text-gray-500 flex items-center justify-center flex-shrink-0">
                {item.name?.slice(0, 2)?.toUpperCase() ?? '??'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
            </div>
            <span className="text-xs font-semibold text-orange-600">→</span>
          </button>
        ))}
      </div>

      {query && (
        <button
          type="button"
          className="w-full px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none border-t border-gray-100"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onViewAll}
        >
          {t('viewAll', { query })}
        </button>
      )}
    </div>
  );
};
