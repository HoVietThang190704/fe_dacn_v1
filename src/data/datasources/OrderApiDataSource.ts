/**
 * Data Source: Order API
 * Handles HTTP requests to order endpoints
 */
import { Order, OrderStatus } from '@/domain/entities/Order';
import { CreateOrderDto } from '@/domain/repositories/IOrderRepository';

export class OrderApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getOrders(userId: string): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/orders?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createOrder(order: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async cancelOrder(orderId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }
  }
}
