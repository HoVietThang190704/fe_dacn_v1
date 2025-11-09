'use client';

import { useState, useEffect } from 'react';
import { GetProductsUseCase } from '@/domain/usecases/GetProductsUseCase';
import { GetProductsParams, ProductsResponse } from '@/domain/repositories/IProductRepository';
import { ProductCategory } from '@/domain/entities/Product';

type SortKey = 'price' | 'name' | 'createdAt';

export const useProductsListViewModel = (
  getProductsUseCase: GetProductsUseCase,
  categories: ProductCategory[]
) => {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetProductsParams>({
    page: 1,
    limit: 24,
    order: 'desc',
    sortBy: 'createdAt',
  });

  const currentCategory = params.category ?? '';
  const currentSearch = params.search ?? '';

  const loadProducts = async (override?: Partial<GetProductsParams>) => {
    const nextParams = { ...params, ...override };
    try {
      setIsLoading(true);
      setError(null);
      const productsData = await getProductsUseCase.execute(nextParams);
      setData(productsData);
      setParams(nextParams);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    loadProducts({ category: categoryId || undefined, page: 1 });
  };

  const handleSearch = (query: string) => {
    loadProducts({ search: query || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    loadProducts({ page });
  };

  const handleSortChange = (sortBy: SortKey, order: 'asc' | 'desc') => {
    loadProducts({ sortBy, order, page: 1 });
  };

  const handleToggleInStock = (inStock?: boolean) => {
    loadProducts({ inStock, page: 1 });
  };

  return {
    data,
    isLoading,
    error,
    selectedCategory: currentCategory,
    searchQuery: currentSearch,
    categories,
    params,
    handleCategoryChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
    handleToggleInStock,
    refresh: () => loadProducts(),
  };
};
