import { VoucherApplicationResult, IOrderRepository } from '@/domain/repositories/IOrderRepository';

export class ApplyVoucherUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(code: string, subtotal: number): Promise<VoucherApplicationResult> {
    if (!code || !code.trim()) {
      throw new Error('Vui lòng nhập mã giảm giá');
    }

    if (subtotal <= 0) {
      throw new Error('Giá trị đơn hàng không hợp lệ');
    }

    return this.orderRepository.applyVoucher(code.trim(), subtotal);
  }
}
