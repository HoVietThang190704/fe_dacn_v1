import React from 'react';
import { ProductCategory } from '@/domain/entities/Product';
import { useTranslations } from 'next-intl';

interface Props {
  categories: ProductCategory[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selectedCategory = '', onCategoryChange }) => {
  const t = useTranslations('products');

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4 border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('filterByCategory')}</h2>
      <div className="flex flex-wrap gap-2">
        <button
          key="all"
          onClick={() => onCategoryChange('')}
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
            selectedCategory === ''
              ? 'bg-orange-500 text-white border-orange-500'
              : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
          }`}
        >
          {t('allCategories')}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
