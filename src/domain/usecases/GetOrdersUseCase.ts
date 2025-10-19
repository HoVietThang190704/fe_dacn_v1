import { IOrderRepository } from '../repositories/IOrderRepository';
import { Order } from '../entities/Order';

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(userId: string): Promise<Order[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    return await this.orderRepository.getOrders(userId);
  }
}
