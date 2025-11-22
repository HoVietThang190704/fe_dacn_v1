export interface CreateVNPayPaymentPayload {
  orderId: string;
  frontendRedirectUrl?: string;
  locale?: 'vn' | 'en';
}

export interface CreateVNPayPaymentResult {
  paymentUrl: string;
  paymentId: string;
  transactionRef: string;
}

export interface IPaymentRepository {
  createVNPayPayment(payload: CreateVNPayPaymentPayload): Promise<CreateVNPayPaymentResult>;
}
