/**
 * View Model: Favorites Page
 * Manages state and business logic for favorites page
 */
'use client';

import { useState, useEffect } from 'react';
import { GetFavoritesUseCase } from '@/domain/usecases/GetFavoritesUseCase';
import { Favorite } from '@/domain/entities/Favorite';

export const useFavoritesViewModel = (
  getFavoritesUseCase: GetFavoritesUseCase,
  userId: string
) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
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
  };

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  return {
    favorites,
    isLoading,
    error,
    refresh: loadFavorites,
  };
};
