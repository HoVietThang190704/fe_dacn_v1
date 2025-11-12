import { Order } from '@/domain/entities/Order';
import {
	CreateOrderPayload,
	OrderListFilters,
	OrderListResult,
	OrderStatistics,
	VoucherApplicationResult,
	UpdateManagedOrderStatusRequest,
} from '@/domain/repositories/IOrderRepository';
import { Voucher } from '@/domain/entities/Voucher';
import { API_ENDPOINTS } from '@/shared/constants/api';
import { authApiClient } from '@/lib/authApiClient';

type OrderItemDto = {
	productId: string;
	productName: string;
	productImage?: string;
	quantity: number;
	price: number;
	subtotal: number;
};

type OrderDto = {
	id: string;
	orderNumber: string;
	userId: string;
	managerId?: string;
	items: OrderItemDto[];
	totalItems: number;
	subtotal: number;
	shippingFee: number;
	discount: number;
	total: number;
	status: Order['status'];
	statusDisplay: string;
	paymentMethod: Order['paymentMethod'];
	paymentStatus: Order['paymentStatus'];
	isInProgress: boolean;
	isCompleted: boolean;
	canBeCancelled: boolean;
	shippingAddress: Order['shippingAddress'];
	createdAt: string;
	updatedAt: string;
	estimatedDelivery?: string;
	deliveredAt?: string;
	daysUntilDelivery?: number | null;
	note?: string;
	cancelReason?: string;
	trackingNumber?: string | null;
	statusHistory?: {
		status: Order['status'];
		changedAt: string;
		changedBy: 'user' | 'manager' | 'system';
		note?: string;
	}[];
	customer?: {
		id: string;
		name?: string;
		email?: string;
		phone?: string;
	};
};

type OrderListApiResponse = {
	message?: string;
	data?: {
		orders: OrderDto[];
		pagination: OrderListResult['pagination'];
	};
};

type OrderDetailApiResponse = {
	message?: string;
	data?: OrderDto;
};

type CreateOrderApiResponse = {
	message?: string;
	data?: OrderDto;
};

type CancelOrderApiResponse = {
	message?: string;
	data?: OrderDto;
};

type VoucherApiResponse = {
	message?: string;
	data?: {
		voucher: Voucher;
		discount: number;
	};
};

type StatisticsApiResponse = {
	message?: string;
	data?: OrderStatistics;
};

export class OrderApiDataSource {
	private buildQuery(filters?: OrderListFilters): string {
		if (!filters) return '';

		const params = new URLSearchParams();

		if (filters.status) params.append('status', filters.status);
		if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
		if (filters.page) params.append('page', filters.page.toString());
		if (filters.limit) params.append('limit', filters.limit.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.orderNumber) params.append('orderNumber', filters.orderNumber);
		if (filters.managerId) params.append('managerId', filters.managerId);

		const query = params.toString();
		return query ? `?${query}` : '';
	}

	private mapOrder(dto: OrderDto): Order {
		return {
			id: dto.id,
			orderNumber: dto.orderNumber,
			userId: dto.userId,
			managerId: dto.managerId,
			items: dto.items.map((item) => ({
				productId: item.productId,
				productName: item.productName,
				productImage: item.productImage,
				quantity: item.quantity,
				price: item.price,
				subtotal: item.subtotal,
			})),
			totalItems: dto.totalItems,
			subtotal: dto.subtotal,
			shippingFee: dto.shippingFee,
			discount: dto.discount,
			total: dto.total,
			status: dto.status,
			statusDisplay: dto.statusDisplay,
			paymentMethod: dto.paymentMethod,
			paymentStatus: dto.paymentStatus,
			isInProgress: dto.isInProgress,
			isCompleted: dto.isCompleted,
			canBeCancelled: dto.canBeCancelled,
			shippingAddress: dto.shippingAddress,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
			estimatedDelivery: dto.estimatedDelivery,
			deliveredAt: dto.deliveredAt,
			daysUntilDelivery: dto.daysUntilDelivery,
			note: dto.note,
				cancelReason: dto.cancelReason,
				trackingNumber: dto.trackingNumber ?? undefined,
				statusHistory: dto.statusHistory?.map((entry) => ({
					status: entry.status,
					changedAt: entry.changedAt,
					changedBy: entry.changedBy,
					note: entry.note,
				})),
				customer: dto.customer
					? {
						id: dto.customer.id,
						name: dto.customer.name,
						email: dto.customer.email,
						phone: dto.customer.phone,
					}
					: undefined,
		};
	}

	async getOrders(filters?: OrderListFilters): Promise<OrderListResult> {
		const query = this.buildQuery(filters);
		const response = await authApiClient.get<OrderListApiResponse>(`${API_ENDPOINTS.ORDERS}${query}`);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tải danh sách đơn hàng');
		}

		const { orders, pagination } = response.data.data;

		return {
			orders: orders.map((order) => this.mapOrder(order)),
			pagination,
		};
	}

	async getManagedOrders(filters?: OrderListFilters): Promise<OrderListResult> {
		const query = this.buildQuery(filters);
		const response = await authApiClient.get<OrderListApiResponse>(`${API_ENDPOINTS.MANAGED_ORDERS}${query}`);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tải danh sách đơn hàng');
		}

		const { orders, pagination } = response.data.data;

		return {
			orders: orders.map((order) => this.mapOrder(order)),
			pagination,
		};
	}

	async getOrderById(orderId: string): Promise<Order> {
		const response = await authApiClient.get<OrderDetailApiResponse>(API_ENDPOINTS.ORDER_DETAIL(orderId));

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tải đơn hàng');
		}

		return this.mapOrder(response.data.data);
	}

	async getManagedOrderById(orderId: string, managerId?: string): Promise<Order> {
		const query = managerId ? `?managerId=${managerId}` : '';
		const response = await authApiClient.get<OrderDetailApiResponse>(`${API_ENDPOINTS.MANAGED_ORDER_DETAIL(orderId)}${query}`);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tải đơn hàng');
		}

		return this.mapOrder(response.data.data);
	}

	async createOrder(payload: CreateOrderPayload): Promise<Order> {
		const response = await authApiClient.post<CreateOrderApiResponse>(API_ENDPOINTS.ORDERS, payload);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tạo đơn hàng');
		}

		return this.mapOrder(response.data.data);
	}

	async cancelOrder(orderId: string, reason: string): Promise<Order> {
		const response = await authApiClient.post<CancelOrderApiResponse>(API_ENDPOINTS.CANCEL_ORDER(orderId), { reason });

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể hủy đơn hàng');
		}

		return this.mapOrder(response.data.data);
	}

	async getStatistics(): Promise<OrderStatistics> {
		const response = await authApiClient.get<StatisticsApiResponse>(API_ENDPOINTS.ORDER_STATISTICS);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể tải thống kê đơn hàng');
		}

		return response.data.data;
	}

	async applyVoucher(code: string, subtotal: number): Promise<VoucherApplicationResult> {
		const response = await authApiClient.post<VoucherApiResponse>(API_ENDPOINTS.APPLY_VOUCHER, {
			code,
			subtotal,
		});

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể áp dụng mã giảm giá');
		}

		return response.data.data;
	}

	async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
		const response = await authApiClient.put<OrderDetailApiResponse>(
			API_ENDPOINTS.ORDER_PAYMENT_STATUS(orderId),
			{
				paymentStatus,
			}
		);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể cập nhật trạng thái thanh toán');
		}

		return this.mapOrder(response.data.data);
	}

	async updateManagedOrderStatus(orderId: string, payload: UpdateManagedOrderStatusRequest): Promise<Order> {
		const response = await authApiClient.request<OrderDetailApiResponse>(
			API_ENDPOINTS.MANAGED_ORDER_STATUS(orderId),
			{
				method: 'PATCH',
				body: JSON.stringify(payload),
			}
		);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
		}

		return this.mapOrder(response.data.data);
	}

	async confirmOrderDelivered(orderId: string, note?: string): Promise<Order> {
		const response = await authApiClient.post<OrderDetailApiResponse>(
			API_ENDPOINTS.CONFIRM_ORDER_DELIVERED(orderId),
			note ? { note } : {}
		);

		if (!response.success || !response.data?.data) {
			throw new Error(response.error || response.data?.message || 'Không thể xác nhận giao hàng');
		}

		return this.mapOrder(response.data.data);
	}
}
