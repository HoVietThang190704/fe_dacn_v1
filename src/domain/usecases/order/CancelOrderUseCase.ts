import { Order } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';

export class CancelOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, reason: string): Promise<Order> {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Vui lòng cung cấp lý do hủy đơn hàng');
    }

    return this.orderRepository.cancelOrder(orderId, reason);
  }
}
