import { IOrderRepository, CreateOrderDto } from '@/domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { OrderApiDataSource } from '../datasources/OrderApiDataSource';

export class OrderRepositoryImpl implements IOrderRepository {
  constructor(private apiDataSource: OrderApiDataSource) {}

  async getOrders(userId: string): Promise<Order[]> {
    return await this.apiDataSource.getOrders(userId);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return await this.apiDataSource.getOrderById(orderId);
  }

  async createOrder(order: CreateOrderDto): Promise<Order> {
    return await this.apiDataSource.createOrder(order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return await this.apiDataSource.updateOrderStatus(orderId, status);
  }

  async cancelOrder(orderId: string): Promise<void> {
    return await this.apiDataSource.cancelOrder(orderId);
  }
}
