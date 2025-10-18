/**
 * View Model: Products List Page
 * Manages state and business logic for products listing page
 */
'use client';

import { useState, useEffect } from 'react';
import { GetProductsUseCase } from '@/domain/usecases/GetProductsUseCase';
import { GetProductsParams, ProductsResponse } from '@/domain/repositories/IProductRepository';
import { ProductCategory } from '@/domain/entities/Product';

export const useProductsListViewModel = (
  getProductsUseCase: GetProductsUseCase,
  categories: ProductCategory[]
) => {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadProducts({ category: categoryId, page: 1 });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const handlePageChange = (page: number) => {
    loadProducts({ page });
  };

  const handleSortChange = (sortBy: 'price' | 'name' | 'newest', order: 'asc' | 'desc') => {
    loadProducts({ sortBy, order, page: 1 });
  };

  return {
    data,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    categories,
    handleCategoryChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
    refresh: () => loadProducts(params),
  };
};
