import { useEffect, useMemo, useState } from 'react';
import { LivestreamProductSummary } from '@/domain/entities/Livestream';
import { container } from '@/presentation/di/container';

interface UseLivestreamProductsResult {
  products: LivestreamProductSummary[];
  isLoading: boolean;
  error: string;
}

const buildInitialKey = (items?: LivestreamProductSummary[]): string => {
  if (!items || items.length === 0) return '';
  return items.map((item) => `${item.id}:${item.price ?? ''}`).join('|');
};

export const useLivestreamProducts = (
  productIds?: string[] | null,
  initialProducts?: LivestreamProductSummary[]
): UseLivestreamProductsResult => {
  const idsKey = useMemo(() => (productIds && productIds.length > 0 ? productIds.join('|') : ''), [productIds]);
  const initialKey = useMemo(() => buildInitialKey(initialProducts), [initialProducts]);

  const [products, setProducts] = useState<LivestreamProductSummary[]>(initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
      setError('');
      return;
    }

    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }

    const shouldSkipFetch = Boolean(initialProducts && initialProducts.length === productIds.length);
    if (shouldSkipFetch) {
      setIsLoading(false);
      setError('');
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const getProductByIdUseCase = container.getProductByIdUseCase;
        const results = await Promise.all(
          productIds.map(async (id) => {
            try {
              const product = await getProductByIdUseCase.execute(id);
              return {
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                thumbnail: product.image,
                stockQuantity: product.stockQuantity,
              } as LivestreamProductSummary;
            } catch (err) {
              console.warn(`[useLivestreamProducts] Failed to load product ${id}`, err);
              return null;
            }
          })
        );

        if (!cancelled) {
          const filtered = results.filter((item): item is LivestreamProductSummary => Boolean(item));
          setProducts(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown_error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [idsKey, initialKey, initialProducts, productIds]);

  // Also update products list when initialProducts change (e.g., stock updates from WS)
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) return;
    setProducts(initialProducts);
  }, [initialProducts]);

  return {
    products,
    isLoading,
    error,
  };
};
