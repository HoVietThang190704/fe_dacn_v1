import { Order } from '@/domain/entities/Order';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';

export class GetManagedOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, managerId?: string): Promise<Order> {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    return this.orderRepository.getManagedOrderById(orderId, managerId);
  }
}
