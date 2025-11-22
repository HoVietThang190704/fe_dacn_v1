import React from 'react';
import { container } from '@/presentation/di/container';
import { Livestream } from '@/domain/entities/Livestream';
import { useTranslations } from 'next-intl';

export const useLivestreams = () => {
  const t = useTranslations('livestream');
  const [activeLivestreams, setActiveLivestreams] = React.useState<Livestream[]>([]);
  const [scheduledLivestreams, setScheduledLivestreams] = React.useState<Livestream[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadLivestreams = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamsUseCase = container.getLivestreamsUseCase;
      const data = await getLivestreamsUseCase.execute();
      setActiveLivestreams(data.active);
      setScheduledLivestreams(data.scheduled);
      setError('');
    } catch (err) {
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadLivestreams();
  }, [loadLivestreams]);

  return {
    activeLivestreams,
    scheduledLivestreams,
    isLoading,
    error,
    loadLivestreams,
  } as const;
};
