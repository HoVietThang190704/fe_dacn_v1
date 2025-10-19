import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order>;
  createOrder(order: CreateOrderDto): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  cancelOrder(orderId: string): Promise<void>;
}

export interface CreateOrderDto {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
}
