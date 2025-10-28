'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetProductByIdUseCase } from '@/domain/usecases/GetProductByIdUseCase';
import { Product } from '@/domain/entities/Product';

export const useProductDetailViewModel = (getProductByIdUseCase: GetProductByIdUseCase, productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const productData = await getProductByIdUseCase.execute(productId);
      setProduct(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getProductByIdUseCase, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    isLoading,
    error,
    refresh: loadProduct,
  };
};