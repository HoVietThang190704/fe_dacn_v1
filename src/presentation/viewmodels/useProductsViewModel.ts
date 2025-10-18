/**
 * View Model: Products Page
 * Manages state and business logic for products listing
 */
'use client';

import { useState, useEffect } from 'react';
import { GetProductsUseCase } from '@/domain/usecases/GetProductsUseCase';
import { GetProductsParams, ProductsResponse } from '@/domain/repositories/IProductRepository';

export const useProductsViewModel = (getProductsUseCase: GetProductsUseCase) => {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetProductsParams>({
    page: 1,
    limit: 20,
  });

  const loadProducts = async (newParams?: GetProductsParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const searchParams = { ...params, ...newParams };
      const productsData = await getProductsUseCase.execute(searchParams);
      setData(productsData);
      if (newParams) {
        setParams(searchParams);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const changePage = (page: number) => {
    loadProducts({ page });
  };

  const changeCategory = (category: string) => {
    loadProducts({ category, page: 1 });
  };

  const changeSort = (sortBy: 'price' | 'name' | 'newest', order: 'asc' | 'desc') => {
    loadProducts({ sortBy, order, page: 1 });
  };

  return {
    data,
    isLoading,
    error,
    params,
    loadProducts,
    changePage,
    changeCategory,
    changeSort,
    refresh: () => loadProducts(params),
  };
};
