export type NotificationStatus = 'all' | 'read' | 'unread';

export interface NotificationPayload {
  url?: string;
  entityId?: string;
  [key: string]: unknown;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  payload?: NotificationPayload | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationListResult {
  items: NotificationEntity[];
  meta: NotificationPaginationMeta;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  hasUnread: boolean;
  latestUnreadAt: string | null;
  latestNotification: NotificationEntity | null;
}
