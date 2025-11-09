import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order } from '../../entities/Order';

export interface PayOrderUseCaseRequest {
  orderId: string;
}

export class PayOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: PayOrderUseCaseRequest): Promise<Order> {
    const { orderId } = request;

    // In a real implementation, this would integrate with payment gateway
    // For demo purposes, we'll just update the payment status to 'paid'
    const updatedOrder = await this.orderRepository.updatePaymentStatus(orderId, 'paid');

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    return updatedOrder;
  }
}