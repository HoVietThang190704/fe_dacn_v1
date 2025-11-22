import { Voucher } from '@/domain/entities/Voucher';

// Use the exact runtime type returned by next-intl's `useTranslations` so callers can pass `t` directly
// without type compatibility issues.
import type { useTranslations } from 'next-intl';

// Accept either the exact `useTranslations` return type OR a looser `key, values` function.
// This keeps strong typing where possible while allowing differently-typed `t` helpers
// (some call sites infer different value shapes) to be passed in without errors.
export type TranslateFn =
  | ReturnType<typeof useTranslations>
  | ((key: string, values?: Record<string, unknown>) => string);

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
