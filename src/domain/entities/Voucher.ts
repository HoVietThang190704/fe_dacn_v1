export type VoucherDiscountType = 'percentage' | 'fixed';

export interface Voucher {
  id: string;
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  isActive: boolean;
}
