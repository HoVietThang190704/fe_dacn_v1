'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NotificationSummary } from '@/domain/entities/Notification';
import { container } from '@/presentation/di/container';

interface NotificationsContextValue {
  summary: NotificationSummary | null;
  isLoading: boolean;
  error: string | null;
  refreshSummary: () => Promise<void>;
  optimisticUpdate: (updater: (current: NotificationSummary | null) => NotificationSummary | null) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const hasToken = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(
    localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken')
  );
};

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const dependencies = useMemo(
    () => ({
      getNotificationSummaryUseCase: container.getNotificationSummaryUseCase,
    }),
    []
  );

  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!hasToken()) {
      setSummary(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await dependencies.getNotificationSummaryUseCase.execute();
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông báo';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [dependencies]);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        if (event.newValue) {
          void refreshSummary();
        } else {
          setSummary(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshSummary]);

  const optimisticUpdate = useCallback(
    (updater: (current: NotificationSummary | null) => NotificationSummary | null) => {
      setSummary((prev) => updater(prev));
    },
    []
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      summary,
      isLoading,
      error,
      refreshSummary,
      optimisticUpdate,
    }),
    [summary, isLoading, error, refreshSummary, optimisticUpdate]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsSummaryContext(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsSummaryContext must be used within NotificationsProvider');
  }
  return context;
}
