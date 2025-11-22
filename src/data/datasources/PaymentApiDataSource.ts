import { authApiClient } from '@/lib/authApiClient';
import { API_ENDPOINTS } from '@/shared/constants/api';
import { CreateVNPayPaymentResult } from '@/domain/repositories/IPaymentRepository';

interface CreateVNPayPaymentResponse {
  message?: string;
  data?: CreateVNPayPaymentResult;
}

interface CreateVNPayPaymentRequestBody {
  orderId: string;
  frontendRedirectUrl?: string;
  locale?: 'vn' | 'en';
}

export class PaymentApiDataSource {
  async createVNPayPayment(body: CreateVNPayPaymentRequestBody): Promise<CreateVNPayPaymentResult> {
    const response = await authApiClient.post<CreateVNPayPaymentResponse>(
      API_ENDPOINTS.PAYMENT_VNPAY_CREATE,
      body
    );

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || response.data?.message || 'Không thể tạo thanh toán VNPay');
    }

    return response.data.data;
  }
}
