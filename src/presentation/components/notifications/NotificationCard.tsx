import React from 'react';
import { NotificationEntity } from '@/domain/entities/Notification';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/presentation/helpers/formatDate';
import { resolveActionUrl } from '@/presentation/helpers/resolveActionUrl';

export const NotificationCard: React.FC<{
  notification: NotificationEntity;
  onClick: () => void;
}> = ({ notification, onClick }) => {
  const t = useTranslations('notificationsPage');
  const actionUrl = resolveActionUrl(notification);
  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:border-orange-200 ${
        notification.isRead ? 'border-gray-100' : 'border-orange-200'
      }`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            notification.isRead ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {notification.isRead ? t('status.read') : t('status.new')}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>{formatDate(notification.createdAt)}</span>
        {notification.payload && notification.payload.entityId && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
            #{String(notification.payload.entityId)}
          </span>
        )}
      </div>
      {actionUrl && (
        <p className="mt-3 inline-flex items-center text-sm font-medium text-orange-600">
          {t('viewDetails')}
        </p>
      )}
    </article>
  );
};
