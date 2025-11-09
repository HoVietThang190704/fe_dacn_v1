import { IOrderRepository, OrderListFilters, OrderListResult } from '../repositories/IOrderRepository';

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(filters?: OrderListFilters): Promise<OrderListResult> {
    return await this.orderRepository.getOrders(filters);
  }
}
