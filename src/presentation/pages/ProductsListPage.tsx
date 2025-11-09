
'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import SortDropdown from '../components/SortDropdown';
import ProductListCard from '../components/ProductListCard';
import EmptyState from '../components/EmptyState';
import { ProductCategory } from '@/domain/entities/Product';
import { container } from '@/presentation/di/container';
import { useProductsListViewModel } from '@/presentation/viewmodels/useProductsListViewModel';

interface ProductsListPageProps {
  categories: ProductCategory[];
}

const SortMapping: Record<string, { sortBy: 'price' | 'name' | 'createdAt'; order: 'asc' | 'desc' }> = {
  default: { sortBy: 'createdAt', order: 'desc' },
  'low-high': { sortBy: 'price', order: 'asc' },
  'high-low': { sortBy: 'price', order: 'desc' },
  name: { sortBy: 'name', order: 'asc' },
};

export const ProductsListPage: React.FC<ProductsListPageProps> = ({ categories }) => {
  const t = useTranslations('products');
  const router = useRouter();
  const [sortKey, setSortKey] = useState<'default' | 'low-high' | 'high-low' | 'name'>('default');

  const viewModel = useProductsListViewModel(container.getProductsUseCase, categories);

  const products = useMemo(() => viewModel.data?.products ?? [], [viewModel.data]);
  const totalProducts = viewModel.data?.total ?? products.length;

  const handleSortChange = (value: string) => {
    const mapping = SortMapping[value] ?? SortMapping.default;
    setSortKey(value as typeof sortKey);
    viewModel.handleSortChange(mapping.sortBy, mapping.order);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    viewModel.handleSearch(value);
  };

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = viewModel.selectedCategory === categoryId ? '' : categoryId;
    viewModel.handleCategoryChange(newCategory);
  };

  return (
    <div className="bg-gray-50 p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {viewModel.isLoading ? t('loading') : t('found', { count: totalProducts })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            defaultValue={viewModel.searchQuery}
            onChange={handleSearchChange}
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
            onChange={handleSortChange}
          />
          <button
            type="button"
            onClick={() => router.push('/main/products/create')}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors"
          >
            {t('createButton')}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('filterByCategory')}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            key="all"
            onClick={() => viewModel.handleCategoryChange('')}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
              viewModel.selectedCategory === ''
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
                viewModel.selectedCategory === category.id
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4 flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => viewModel.handleToggleInStock(true)}
          className="px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          {t('inStockOnly')}
        </button>
        <button
          onClick={() => viewModel.handleToggleInStock(false)}
          className="px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          {t('outOfStockOnly')}
        </button>
        <button
          onClick={() => viewModel.handleToggleInStock(undefined)}
          className="px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          {t('clearStockFilter')}
        </button>
      </div>

      {viewModel.error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{viewModel.error}</span>
            <button
              className="text-sm underline"
              onClick={viewModel.refresh}
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {viewModel.isLoading ? (
        <LoadingState />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductListCard key={product.id} product={product} router={router} t={t} />
          ))}
        </div>
      ) : (
        <EmptyState t={t} />
      )}

      <div className="flex justify-between items-center pt-4">
        <span className="text-xs text-gray-500">
          {t('paginationInfo', {
            page: viewModel.params.page ?? 1,
            totalPages: viewModel.data?.totalPages ?? 1,
          })}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => viewModel.handlePageChange((viewModel.params.page ?? 1) - 1)}
            disabled={(viewModel.params.page ?? 1) <= 1 || viewModel.isLoading}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            {t('prevPage')}
          </button>
          <button
            onClick={() => viewModel.handlePageChange((viewModel.params.page ?? 1) + 1)}
            disabled={
              (viewModel.params.page ?? 1) >= (viewModel.data?.totalPages ?? 1) || viewModel.isLoading
            }
            className="px-3 py-1.5 border rounded disabled:opacity-50"
          >
            {t('nextPage')}
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-t-lg" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
