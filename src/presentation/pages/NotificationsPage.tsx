"use client";

import { useNotificationsPage } from '@/presentation/hooks/useNotificationsPage';
import { NotificationCard } from '@/presentation/components/notifications/NotificationCard';
import { EmptyState } from '@/presentation/components/notifications/EmptyState';
import { NotificationsSkeleton } from '@/presentation/components/notifications/NotificationsSkeleton';

export const NotificationsPage = () => {
  const {
    t,
    notifications,
    statusFilter,
    isLoading,
    isLoadingMore,
    isMutating,
    error,
    hasMore,
    setStatusFilter,
    refresh,
    loadMore,
    handleNotificationClick,
    handleMarkAll,
    unreadCount,
    filters,
  } = useNotificationsPage();

  const showSkeleton = isLoading && notifications.length === 0;

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-400">{t('eyebrow')}</p>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500 md:text-base">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-white"
            onClick={refresh}
            disabled={isLoading}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {t('actions.refresh')}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              unreadCount === 0 || isMutating
                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || isMutating}
          >
            {t('actions.markAll')} ({unreadCount})
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              statusFilter === filter.key
                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                : 'border-transparent bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{filter.label}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-500">
              {filter.badge}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {showSkeleton && <NotificationsSkeleton />}
        {!showSkeleton && notifications.length === 0 && <EmptyState />}
        {!showSkeleton &&
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} onClick={() => handleNotificationClick(notification)} />
          ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {isLoadingMore ? t('loadingMore') : t('loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};


