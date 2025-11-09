import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/domain/entities/Product';
import { container } from '@/presentation/di/container';

export function useUserProducts(userId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await container.getProductsUseCase.execute({
        owner: userId,
        limit: 100, // Load more for profile
      });

      setProducts(result.products);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading user products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    error,
    refresh,
  };
}