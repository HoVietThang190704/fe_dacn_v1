import { Order } from '@/domain/entities/Order';
import { IOrderRepository, UpdateManagedOrderStatusRequest } from '@/domain/repositories/IOrderRepository';

export class UpdateManagedOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderId: string, payload: UpdateManagedOrderStatusRequest): Promise<Order> {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    return this.orderRepository.updateManagedOrderStatus(orderId, payload);
  }
}
