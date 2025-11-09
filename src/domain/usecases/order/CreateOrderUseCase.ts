import { Order } from '@/domain/entities/Order';
import { CreateOrderPayload, IOrderRepository } from '@/domain/repositories/IOrderRepository';

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(payload: CreateOrderPayload): Promise<Order> {
    return this.orderRepository.createOrder(payload);
  }
}
