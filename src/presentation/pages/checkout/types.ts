import { Voucher } from '@/domain/entities/Voucher';

export type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

export interface ShippingAddress {
  id?: string;
  recipientName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  note?: string;
  label?: string;
  isDefault?: boolean;
  fullAddress?: string;
}

export interface VoucherInfo {
  code: string;
  discount: number;
  voucher: Voucher;
}
