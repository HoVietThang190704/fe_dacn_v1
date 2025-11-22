import {
  CreateVNPayPaymentPayload,
  CreateVNPayPaymentResult,
  IPaymentRepository,
} from '@/domain/repositories/IPaymentRepository';
import { PaymentApiDataSource } from '@/data/datasources/PaymentApiDataSource';

export class PaymentRepositoryImpl implements IPaymentRepository {
  constructor(private readonly paymentApiDataSource: PaymentApiDataSource) {}

  async createVNPayPayment(payload: CreateVNPayPaymentPayload): Promise<CreateVNPayPaymentResult> {
    return this.paymentApiDataSource.createVNPayPayment(payload);
  }
}
