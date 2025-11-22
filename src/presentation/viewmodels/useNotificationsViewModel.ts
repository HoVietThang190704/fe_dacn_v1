'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NOTIFICATIONS_CONFIG } from '@/presentation/config/notifications.config';
import {
  NotificationEntity,
  NotificationListResult,
  NotificationPaginationMeta,
  NotificationStatus,
} from '@/domain/entities/Notification';
import { GetNotificationsUseCase } from '@/domain/usecases/notifications/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '@/domain/usecases/notifications/MarkNotificationReadUseCase';
import { MarkAllNotificationsReadUseCase } from '@/domain/usecases/notifications/MarkAllNotificationsReadUseCase';

export interface NotificationsViewModelDependencies {
  getNotificationsUseCase: GetNotificationsUseCase;
  markNotificationReadUseCase: MarkNotificationReadUseCase;
  markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase;
}

export interface NotificationsViewModel {
  notifications: NotificationEntity[];
  meta: NotificationPaginationMeta | null;
  statusFilter: NotificationStatus;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMutating: boolean;
  error: string | null;
  hasMore: boolean;
  setStatusFilter: (status: NotificationStatus) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<NotificationEntity | null>;
  markAllNotificationsAsRead: () => Promise<number>;
}

const hasAuthToken = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(
    localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken')
  );
};

export function useNotificationsViewModel(
  deps: NotificationsViewModelDependencies,
  initialStatus: NotificationStatus = 'all'
): NotificationsViewModel {
  const { getNotificationsUseCase, markNotificationReadUseCase, markAllNotificationsReadUseCase } = deps;
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [meta, setMeta] = useState<NotificationPaginationMeta | null>(null);
  const [statusFilter, setStatusFilter] = useState<NotificationStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limitRef = useRef<number>(NOTIFICATIONS_CONFIG.defaultPageLimit);

  const fetchNotifications = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (!hasAuthToken()) {
        setNotifications([]);
        setMeta(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result: NotificationListResult = await getNotificationsUseCase.execute({
          page: pageToLoad,
          limit: limitRef.current,
          status: statusFilter,
        });
        limitRef.current = result.meta.limit;
        setMeta(result.meta);
        setNotifications((prev) => (append ? [...prev, ...result.items] : result.items));
        setPage(pageToLoad);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải thông báo';
        setError(message);
        if (!append) {
          setNotifications([]);
          setMeta(null);
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [getNotificationsUseCase, statusFilter]
  );

  useEffect(() => {
    void fetchNotifications(1, false);
  }, [fetchNotifications]);

  const refresh = useCallback(async () => {
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  const hasMore = useMemo(() => {
    if (!meta) return false;
    return meta.page * meta.limit < meta.total;
  }, [meta]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }
    await fetchNotifications(page + 1, true);
  }, [fetchNotifications, hasMore, isLoading, isLoadingMore, page]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!notificationId) {
        return null;
      }
      setIsMutating(true);
      setError(null);
      try {
        const updated = await markNotificationReadUseCase.execute(notificationId);
        let wasUnread = false;
        setNotifications((prev) =>
          prev.map((item) => {
            if (item.id === notificationId) {
              wasUnread = !item.isRead;
              return updated;
            }
            return item;
          })
        );
        if (wasUnread) {
          setMeta((prev) =>
            prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev
          );
        }
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể cập nhật thông báo';
        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [markNotificationReadUseCase]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    setIsMutating(true);
    setError(null);
    try {
      const result = await markAllNotificationsReadUseCase.execute();
      if (result.updated > 0) {
        const timestamp = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((item) =>
            item.isRead
              ? item
              : {
                  ...item,
                  isRead: true,
                  readAt: item.readAt ?? timestamp,
                }
          )
        );
        setMeta((prev) => (prev ? { ...prev, unreadCount: 0 } : prev));
      }
      return result.updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật thông báo';
      setError(message);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [markAllNotificationsReadUseCase]);

  const updateStatusFilter = useCallback((status: NotificationStatus) => {
    setStatusFilter(status);
  }, []);

  return {
    notifications,
    meta,
    statusFilter,
    isLoading,
    isLoadingMore,
    isMutating,
    error,
    hasMore,
    setStatusFilter: updateStatusFilter,
    refresh,
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}
