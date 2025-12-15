
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import SortDropdown from '../components/SortDropdown';
import ProductListCard from '../components/ProductListCard';
import EmptyState from '../components/EmptyState';
import ProductsHeader from '@/presentation/components/ProductsHeader';
import CategoryFilter from '@/presentation/components/CategoryFilter';
import StockFilter from '@/presentation/components/StockFilter';
import ProductsLoading from '@/presentation/components/ProductsLoading';
import { ICONS } from '@/shared/constants/images';
import Image from 'next/image';
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

  useEffect(() => {
    if (!viewModel.isLoading) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [viewModel.params.page, viewModel.isLoading]);

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
      <ProductsHeader
        searchQuery={viewModel.searchQuery}
        sortKey={sortKey}
        onSearch={(v: string) => viewModel.handleSearch(v)}
        onSortChange={handleSortChange}
        onCreate={() => router.push('/main/products/create')}
        subtitle={viewModel.isLoading ? t('loading') : t('found', { count: totalProducts })}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={viewModel.selectedCategory}
        onCategoryChange={viewModel.handleCategoryChange}
      />

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
        <ProductsLoading />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductListCard key={product.id} product={product} router={router} />
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
            className="px-3 py-1.5 border rounded disabled:opacity-50 flex items-center gap-2"
            aria-label={String(t('prevPage'))}
          >
            {ICONS.ARROW_LEFT ? <Image src={ICONS.ARROW_LEFT} alt={String(t('prevPage'))} width={16} height={16} className="w-4 h-4" unoptimized/> : t('prevPage')}
          </button>
          <button
            onClick={() => viewModel.handlePageChange((viewModel.params.page ?? 1) + 1)}
            disabled={
              (viewModel.params.page ?? 1) >= (viewModel.data?.totalPages ?? 1) || viewModel.isLoading
            }
            className="px-3 py-1.5 border rounded disabled:opacity-50 flex items-center gap-2"
            aria-label={String(t('nextPage'))}
          >
            {ICONS.ARROW_RIGHT ? <Image src={ICONS.ARROW_RIGHT} alt={String(t('nextPage'))} width={16} height={16} className="w-4 h-4" unoptimized/> : t('nextPage')}
          </button>
        </div>
      </div>
    </div>
  );
};

