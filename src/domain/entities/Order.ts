export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type PaymentMethod = 'cod' | 'momo' | 'zalopay' | 'vnpay' | 'card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderStatusChangedBy = 'user' | 'manager' | 'system';

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy: OrderStatusChangedBy;
  note?: string;
}

export interface OrderCustomerSummary {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  fullAddress: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  managerId?: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  statusDisplay: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isInProgress: boolean;
  isCompleted: boolean;
  canBeCancelled: boolean;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  daysUntilDelivery?: number | null;
  note?: string;
  cancelReason?: string;
  trackingNumber?: string | null;
  statusHistory?: OrderStatusHistoryEntry[];
  customer?: OrderCustomerSummary;
}
