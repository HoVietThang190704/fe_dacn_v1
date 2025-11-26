import React from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  onToggleInStock: (v?: boolean) => void;
}

const StockFilter: React.FC<Props> = ({ onToggleInStock }) => {
  const t = useTranslations('products');

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4 flex flex-wrap gap-2 text-sm">
      <button
        onClick={() => onToggleInStock(true)}
        className="px-3 py-1.5 border rounded hover:bg-gray-50"
      >
        {t('inStockOnly')}
      </button>
      <button
        onClick={() => onToggleInStock(false)}
        className="px-3 py-1.5 border rounded hover:bg-gray-50"
      >
        {t('outOfStockOnly')}
      </button>
      <button
        onClick={() => onToggleInStock(undefined)}
        className="px-3 py-1.5 border rounded hover:bg-gray-50"
      >
        {t('clearStockFilter')}
      </button>
    </div>
  );
};

export default StockFilter;
