import { ManagedOrderFilterStatus } from '@/presentation/viewmodels/useManagedOrdersViewModel';
import { ORDER_STATUS } from '@/domain/entities/Order';

export const PAGE_SIZES = [10, 20, 50] as const;

export const DEFAULT_MANAGED_ORDER_LIMIT = PAGE_SIZES[0];

export const getFilterOptions = (t: (key: string) => string): Array<{ value: ManagedOrderFilterStatus; label: string }> => [
  { value: 'ALL', label: t('filter.all') },
  { value: ORDER_STATUS.PENDING, label: t('status.pending') },
  { value: ORDER_STATUS.CONFIRMED, label: t('status.confirmed') },
  { value: ORDER_STATUS.PREPARING, label: t('status.preparing') },
  { value: ORDER_STATUS.SHIPPING, label: t('status.shipping') },
  { value: ORDER_STATUS.DELIVERED, label: t('status.delivered') },
  { value: ORDER_STATUS.CANCELLED, label: t('status.cancelled') },
  { value: ORDER_STATUS.REFUNDED, label: t('status.refunded') },
];
