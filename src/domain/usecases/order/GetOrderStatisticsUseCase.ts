import { IOrderRepository, OrderStatistics } from '@/domain/repositories/IOrderRepository';

export class GetOrderStatisticsUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<OrderStatistics> {
    return this.orderRepository.getStatistics();
  }
}
