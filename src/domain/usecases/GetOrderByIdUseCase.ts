import { IOrderRepository } from '../repositories/IOrderRepository';
import { Order } from '../entities/Order';

export class GetOrderByIdUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<Order> {
    return await this.orderRepository.getOrderById(orderId);
  }
}