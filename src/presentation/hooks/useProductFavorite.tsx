import { useCallback, useEffect, useRef, useState } from 'react';
import { PRODUCT_CONFIG } from '@/presentation/config/productConfig';
import { container } from '@/presentation/di/container';
import { useTranslations } from 'next-intl';

export const useProductFavorite = (productId?: string, isAuthenticated?: boolean, userId?: string) => {
  const tFav = useTranslations('favorites');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);

  const clearStatusTimeout = useCallback(() => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
  }, []);

  const scheduleClear = useCallback(() => {
    clearStatusTimeout();
    statusTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage(null);
      statusTimeoutRef.current = null;
    }, PRODUCT_CONFIG.FAVORITE_STATUS_TIMEOUT_MS);
  }, [clearStatusTimeout]);

  const loadFavoriteStatus = useCallback(async () => {
    if (!productId || !isAuthenticated || !userId) {
      setIsFavorite(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setStatusMessage(null);
      const favorites = await container.getFavoritesUseCase.execute(userId);
      setIsFavorite(favorites.some((item) => item.productId === productId));
    } catch {
      setError(tFav('cannotLoadFavoriteStatus'));
    } finally {
      setIsLoading(false);
    }
  }, [productId, isAuthenticated, userId, tFav]);

  useEffect(() => {
    loadFavoriteStatus();
    return () => {
      clearStatusTimeout();
    };
  }, [loadFavoriteStatus, clearStatusTimeout]);

  const toggleFavorite = useCallback(async () => {
    if (!productId) return null;
    if (!isAuthenticated || !userId) return null;

    try {
      setIsLoading(true);
      setError(null);
      setStatusMessage(null);
      const favorites = await container.toggleFavoriteUseCase.execute(productId);
      const nextIsFavorite = favorites.some((item) => item.productId === productId);
      setIsFavorite(nextIsFavorite);
      setStatusMessage(nextIsFavorite ? tFav('addedToFavorites') : tFav('removedFromFavorites'));
      scheduleClear();
      return nextIsFavorite;
    } catch {
      setError(tFav('cannotUpdateFavorite'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [productId, isAuthenticated, userId, tFav, scheduleClear]);

  return {
    isFavorite,
    isLoading,
    error,
    statusMessage,
    toggleFavorite,
    setError,
  };
};
