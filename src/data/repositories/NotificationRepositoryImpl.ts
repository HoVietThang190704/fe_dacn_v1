import { NotificationApiDataSource } from '@/data/datasources/NotificationApiDataSource';
import {
  INotificationRepository,
  NotificationQuery,
} from '@/domain/repositories/INotificationRepository';
import { NotificationEntity, NotificationListResult, NotificationSummary } from '@/domain/entities/Notification';

export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private readonly apiDataSource: NotificationApiDataSource) {}

  getNotifications(query?: NotificationQuery): Promise<NotificationListResult> {
    return this.apiDataSource.getNotifications(query);
  }

  markAsRead(notificationId: string): Promise<NotificationEntity> {
    return this.apiDataSource.markAsRead(notificationId);
  }

  markAllAsRead(): Promise<{ updated: number }> {
    return this.apiDataSource.markAllAsRead();
  }

  getSummary(): Promise<NotificationSummary> {
    return this.apiDataSource.getSummary();
  }
}
