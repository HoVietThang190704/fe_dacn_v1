import { NotificationEntity } from '@/domain/entities/Notification';
import { INotificationRepository } from '@/domain/repositories/INotificationRepository';

export class MarkNotificationReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(notificationId: string): Promise<NotificationEntity> {
    if (!notificationId) {
      return Promise.reject(new Error('Missing notification id'));
    }
    return this.repository.markAsRead(notificationId);
  }
}
