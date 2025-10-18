/**
 * View Model: Home Page
 * Manages state and business logic for home page
 */
'use client';

import { useState, useEffect } from 'react';
import { GetHomeDataUseCase, HomePageData } from '@/domain/usecases/GetHomeDataUseCase';

export const useHomeViewModel = (getHomeDataUseCase: GetHomeDataUseCase) => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const homeData = await getHomeDataUseCase.execute();
      setData(homeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load home data');
      console.error('Error loading home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh: loadHomeData,
  };
};
