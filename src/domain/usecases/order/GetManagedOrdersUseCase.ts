import { IOrderRepository, OrderListFilters, OrderListResult } from '@/domain/repositories/IOrderRepository';

export class GetManagedOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(filters?: OrderListFilters): Promise<OrderListResult> {
    return this.orderRepository.getManagedOrders(filters);
  }
}
