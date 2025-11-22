import {
  NotificationEntity,
  NotificationListResult,
  NotificationSummary,
  NotificationStatus,
} from '@/domain/entities/Notification';

export interface NotificationQuery {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
}

export interface INotificationRepository {
  getNotifications(query?: NotificationQuery): Promise<NotificationListResult>;
  markAsRead(notificationId: string): Promise<NotificationEntity>;
  markAllAsRead(): Promise<{ updated: number }>;
  getSummary(): Promise<NotificationSummary>;
}
