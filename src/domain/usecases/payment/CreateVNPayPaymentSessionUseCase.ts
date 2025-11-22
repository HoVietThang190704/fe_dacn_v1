import {
  CreateVNPayPaymentPayload,
  CreateVNPayPaymentResult,
  IPaymentRepository,
} from '@/domain/repositories/IPaymentRepository';

export class CreateVNPayPaymentSessionUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(payload: CreateVNPayPaymentPayload): Promise<CreateVNPayPaymentResult> {
    if (!payload?.orderId) {
      throw new Error('Thiếu orderId để khởi tạo thanh toán VNPay');
    }
    return this.paymentRepository.createVNPayPayment(payload);
  }
}
