import { NotificationEntity } from '@/domain/entities/Notification';

export const resolveActionUrl = (notification: NotificationEntity): string | undefined => {
  const payload = notification.payload;
  if (!payload) return undefined;
  if (typeof payload.url === 'string') return payload.url;
  if (typeof (payload as Record<string, unknown>).href === 'string') {
    return String((payload as Record<string, unknown>).href);
  }
  if (typeof (payload as Record<string, unknown>).redirectUrl === 'string') {
    return String((payload as Record<string, unknown>).redirectUrl);
  }
  return undefined;
};
