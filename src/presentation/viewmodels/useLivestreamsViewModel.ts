/**
 * View Model: Livestreams Page
 * Manages state and business logic for livestreams page
 */
'use client';

import { useState, useEffect } from 'react';
import { GetLivestreamsUseCase } from '@/domain/usecases/GetLivestreamsUseCase';
import { Livestream } from '@/domain/entities/Livestream';

export const useLivestreamsViewModel = (getLivestreamsUseCase: GetLivestreamsUseCase) => {
  const [activeLivestreams, setActiveLivestreams] = useState<Livestream[]>([]);
  const [scheduledLivestreams, setScheduledLivestreams] = useState<Livestream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled'>('live');

  const loadLivestreams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { active, scheduled } = await getLivestreamsUseCase.execute();
      setActiveLivestreams(active);
      setScheduledLivestreams(scheduled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load livestreams');
      console.error('Error loading livestreams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLivestreams();
    // Auto refresh every 30 seconds for live data
    const interval = setInterval(loadLivestreams, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    activeLivestreams,
    scheduledLivestreams,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refresh: loadLivestreams,
  };
};
