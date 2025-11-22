'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { useNotificationsViewModel } from '@/presentation/viewmodels/useNotificationsViewModel';
import { useNotificationsSummary } from '@/shared/hooks/useNotificationsSummary';
import { NotificationStatus, NotificationEntity } from '@/domain/entities/Notification';
import { formatDate } from '@/presentation/helpers/formatDate';
import { resolveActionUrl } from '@/presentation/helpers/resolveActionUrl';
import { NOTIFICATIONS_CONFIG } from '@/presentation/config/notifications.config';

export function useNotificationsPage() {
  const t = useTranslations('notificationsPage');
  const router = useRouter();
  const { refreshSummary, summary } = useNotificationsSummary();

  const dependencies = useMemo(
    () => ({
      getNotificationsUseCase: container.getNotificationsUseCase,
      markNotificationReadUseCase: container.markNotificationReadUseCase,
      markAllNotificationsReadUseCase: container.markAllNotificationsReadUseCase,
    }),
    []
  );

  const {
    notifications,
    meta,
    statusFilter,
    isLoading,
    isLoadingMore,
    isMutating,
    error,
    hasMore,
    setStatusFilter,
    refresh,
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotificationsViewModel(dependencies);

  const [pageError, setPageError] = useState<string | null>(null);

  const unreadCount = meta?.unreadCount ?? summary?.unread ?? 0;

  const handleNotificationClick = useCallback(
    async (notification: NotificationEntity) => {
      try {
        if (!notification.isRead) {
          await markNotificationAsRead(notification.id);
          await refreshSummary();
        }
        const targetUrl = resolveActionUrl(notification);
        if (targetUrl) {
          router.push(targetUrl);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t('errors.openNotification');
        setPageError(message);
      }
    },
    [markNotificationAsRead, refreshSummary, router, t]
  );

  const handleMarkAll = useCallback(async () => {
    try {
      const updated = await markAllNotificationsAsRead();
      if (updated > 0) {
        await refreshSummary();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.updateNotifications');
      setPageError(message);
    }
  }, [markAllNotificationsAsRead, refreshSummary, t]);

  const filters: { key: NotificationStatus; label: string; badge: number }[] = useMemo(
    () => [
      { key: 'all', label: t('filters.all'), badge: meta?.total ?? 0 },
      { key: 'unread', label: t('filters.unread'), badge: meta?.unreadCount ?? summary?.unread ?? 0 },
      { key: 'read', label: t('filters.read'), badge: Math.max(0, (meta?.total ?? 0) - (meta?.unreadCount ?? summary?.unread ?? 0)) },
    ],
    [meta?.total, meta?.unreadCount, summary?.unread, t]
  );

  return {
    t,
    notifications,
    meta,
    statusFilter,
    isLoading,
    isLoadingMore,
    isMutating,
    error: error ?? pageError,
    hasMore,
    setStatusFilter,
    refresh,
    loadMore,
    handleNotificationClick,
    handleMarkAll,
    unreadCount,
    filters,
    formatDate,
    NOTIFICATIONS_CONFIG,
  };
}
