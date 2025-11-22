import { NotificationSummary } from '@/domain/entities/Notification';
import { INotificationRepository } from '@/domain/repositories/INotificationRepository';

export class GetNotificationSummaryUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(): Promise<NotificationSummary> {
    return this.repository.getSummary();
  }
}
