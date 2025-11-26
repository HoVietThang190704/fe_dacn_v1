import React from 'react';
import { useTranslations } from 'next-intl';
import SortDropdown from './SortDropdown';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

interface Props {
  searchQuery?: string;
  sortKey: string;
  onSearch: (v: string) => void;
  onSortChange: (v: string) => void;
  onCreate: () => void;
  subtitle?: React.ReactNode;
}

const ProductsHeader: React.FC<Props> = ({ searchQuery, sortKey, onSearch, onSortChange, onCreate, subtitle }) => {
  const t = useTranslations('products');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
        {subtitle ? <p className="text-sm text-gray-600 mt-1">{subtitle}</p> : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          defaultValue={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />

        <SortDropdown
          value={sortKey}
          options={[
            { value: 'default', label: t('sortDefault') },
            { value: 'low-high', label: t('sortLowHigh') },
            { value: 'high-low', label: t('sortHighLow') },
            { value: 'name', label: t('sortName') },
          ]}
          align="right"
          onChange={onSortChange}
        />

        <button
          type="button"
          onClick={onCreate}
          className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          {ICONS.PLUS ? (
            <Image src={ICONS.PLUS} alt={String(t('createButton'))} width={16} height={16} className="w-4 h-4" unoptimized />
          ) : null}
          <span>{t('createButton')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductsHeader;
