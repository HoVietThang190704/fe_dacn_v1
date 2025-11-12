import { Order, OrderStatus, PaymentMethod } from '../entities/Order';
import { Voucher } from '../entities/Voucher';

export interface OrderListFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
  orderNumber?: string;
  paymentStatus?: string;
  managerId?: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListResult {
  orders: Order[];
  pagination: OrderPagination;
}

export interface CreateOrderPayload {
  cartItemIds?: string[];
  paymentMethod?: PaymentMethod;
  note?: string;
  voucherCode?: string;
  shippingAddressId?: string;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    note?: string;
    label?: string;
    isDefault?: boolean;
  };
  saveShippingAddress?: boolean;
}

export interface OrderStatistics {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

export interface VoucherApplicationResult {
  voucher: Voucher;
  discount: number;
}

export interface UpdateManagedOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  note?: string | null;
}

export interface IOrderRepository {
  getOrders(filters?: OrderListFilters): Promise<OrderListResult>;
  getOrderById(orderId: string): Promise<Order>;
  createOrder(payload: CreateOrderPayload): Promise<Order>;
  cancelOrder(orderId: string, reason: string): Promise<Order>;
  getStatistics(): Promise<OrderStatistics>;
  applyVoucher(code: string, subtotal: number): Promise<VoucherApplicationResult>;
  updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order>;
  getManagedOrders(filters?: OrderListFilters): Promise<OrderListResult>;
  getManagedOrderById(orderId: string, managerId?: string): Promise<Order>;
  updateManagedOrderStatus(orderId: string, payload: UpdateManagedOrderStatusRequest): Promise<Order>;
  confirmOrderDelivered(orderId: string, note?: string): Promise<Order>;
}
