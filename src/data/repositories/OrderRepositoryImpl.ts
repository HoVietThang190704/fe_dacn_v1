import {
  IOrderRepository,
  CreateOrderPayload,
  OrderListFilters,
  OrderListResult,
  OrderStatistics,
  VoucherApplicationResult,
} from '@/domain/repositories/IOrderRepository';
import { Order } from '@/domain/entities/Order';
import { OrderApiDataSource } from '../datasources/OrderApiDataSource';

export class OrderRepositoryImpl implements IOrderRepository {
  constructor(private apiDataSource: OrderApiDataSource) {}

  async getOrders(filters?: OrderListFilters): Promise<OrderListResult> {
    return await this.apiDataSource.getOrders(filters);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return await this.apiDataSource.getOrderById(orderId);
  }

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    return await this.apiDataSource.createOrder(payload);
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    return await this.apiDataSource.cancelOrder(orderId, reason);
  }

  async getStatistics(): Promise<OrderStatistics> {
    return await this.apiDataSource.getStatistics();
  }

  async applyVoucher(code: string, subtotal: number): Promise<VoucherApplicationResult> {
    return await this.apiDataSource.applyVoucher(code, subtotal);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
    return await this.apiDataSource.updatePaymentStatus(orderId, paymentStatus);
  }
}
