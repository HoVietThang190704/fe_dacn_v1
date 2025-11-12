import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order } from '../../entities/Order';

export interface PayOrderUseCaseRequest {
  orderId: string;
}

export class PayOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: PayOrderUseCaseRequest): Promise<Order> {
    const { orderId } = request;
    const updatedOrder = await this.orderRepository.updatePaymentStatus(orderId, 'paid');
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return updatedOrder;
  }
}