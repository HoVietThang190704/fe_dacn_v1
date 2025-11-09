'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetFavoritesUseCase } from '@/domain/usecases/GetFavoritesUseCase';
import { Favorite } from '@/domain/entities/Favorite';
import { RemoveFavoriteUseCase } from '@/domain/usecases/RemoveFavoriteUseCase';
import { ToggleFavoriteUseCase } from '@/domain/usecases/ToggleFavoriteUseCase';

type Dependencies = {
  getFavoritesUseCase: GetFavoritesUseCase;
  removeFavoriteUseCase: RemoveFavoriteUseCase;
  toggleFavoriteUseCase: ToggleFavoriteUseCase;
};

export const useFavoritesViewModel = (
  { getFavoritesUseCase, removeFavoriteUseCase, toggleFavoriteUseCase }: Dependencies,
  userId?: string
) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (userId === undefined) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const favoritesData = await getFavoritesUseCase.execute(userId);
      setFavorites(favoritesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getFavoritesUseCase, userId]);

  const removeFavorite = useCallback(
    async (productId: string) => {
      try {
        setIsMutating(true);
        setError(null);
        const updated = await removeFavoriteUseCase.execute(productId);
        setFavorites(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove favorite');
        console.error('Error removing favorite:', err);
      } finally {
        setIsMutating(false);
      }
    },
    [removeFavoriteUseCase]
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      try {
        setIsMutating(true);
        setError(null);
        const updated = await toggleFavoriteUseCase.execute(productId);
        setFavorites(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update favorite');
        console.error('Error toggling favorite:', err);
      } finally {
        setIsMutating(false);
      }
    },
    [toggleFavoriteUseCase]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.productId === productId),
    [favorites]
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    isMutating,
    error,
    refresh: loadFavorites,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
