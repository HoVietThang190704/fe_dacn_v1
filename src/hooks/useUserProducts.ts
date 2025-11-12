import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/domain/entities/Product';
import { container } from '@/presentation/di/container';

export function useUserProducts(userId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await container.getProductsUseCase.execute({
        owner: userId,
        limit: 100, 
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

  const deleteProduct = useCallback(async (productId: string) => {
    if (!productId) return;

    try {
      setIsMutating(true);
      setError(null);
      await container.deleteProductUseCase.execute(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      throw (err instanceof Error ? err : new Error(message));
    } finally {
      setIsMutating(false);
    }
  }, []);

  const toggleProductAvailability = useCallback(async (productId: string, nextInStock: boolean) => {
    try {
      setIsMutating(true);
      setError(null);
      const updatedProduct = await container.updateProductUseCase.execute(productId, { inStock: nextInStock });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...updatedProduct,
                stock: updatedProduct.stock ?? updatedProduct.stockQuantity ?? product.stock,
                stockQuantity: updatedProduct.stockQuantity ?? product.stockQuantity,
                inStock: updatedProduct.inStock ?? nextInStock,
              }
            : product
        )
      );
      return updatedProduct;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product status';
      setError(message);
      throw (err instanceof Error ? err : new Error(message));
    } finally {
      setIsMutating(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    isMutating,
    error,
    refresh,
    deleteProduct,
    toggleProductAvailability,
  };
}