import { NotificationListResult } from '@/domain/entities/Notification';
import { INotificationRepository, NotificationQuery } from '@/domain/repositories/INotificationRepository';

export class GetNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(query?: NotificationQuery): Promise<NotificationListResult> {
    return this.repository.getNotifications(query);
  }
}
