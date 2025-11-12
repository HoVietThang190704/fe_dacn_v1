import { Order } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';

export class ConfirmOrderDeliveredUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, note?: string): Promise<Order> {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    return this.orderRepository.confirmOrderDelivered(orderId, note);
  }
}
