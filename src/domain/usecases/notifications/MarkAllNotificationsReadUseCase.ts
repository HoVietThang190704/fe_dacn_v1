import { INotificationRepository } from '@/domain/repositories/INotificationRepository';

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(): Promise<{ updated: number }> {
    return this.repository.markAllAsRead();
  }
}
