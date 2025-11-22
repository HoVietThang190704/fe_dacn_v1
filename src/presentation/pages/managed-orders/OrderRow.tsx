import React, { useMemo } from 'react';
import { Order, OrderStatus } from '@/domain/entities/Order';
import { useFormatCurrency } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

type OrderRowProps = {
  order: Order;
  statusOptions: Array<{ value: OrderStatus; label: string }>;
  statusDraft: OrderStatus;
  updating: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onUpdateStatus: (order: Order) => void;
  onViewDetail: (orderId: string) => void;
};

export const OrderRow = ({
  order,
  statusOptions,
  statusDraft,
  updating,
  onStatusChange,
  onUpdateStatus,
  onViewDetail,
}: OrderRowProps) => {
  const t = useTranslations('orders');
  const locale = useLocale();
  const formatCurrency = useFormatCurrency();

  const customerName = order.customer?.name || order.shippingAddress?.recipientName || t('labels.noProduct');
  const customerContact = order.customer?.phone || order.shippingAddress?.phone || order.customer?.email || '—';
  const createdAt = useMemo(() => {
    if (!order.createdAt) return '—';
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt));
    } catch {
      return order.createdAt;
    }
  }, [order.createdAt, locale]);

  return (
    <tr className="align-top">
      <td className="px-4 py-4 font-semibold text-gray-900">#{order.orderNumber}</td>
      <td className="px-4 py-4 text-sm text-gray-600">
        <div className="font-medium text-gray-900">{customerName}</div>
        <div className="text-xs text-gray-500">{customerContact}</div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-700">{formatCurrency(order.total)}</td>
      <td className="px-4 py-4 text-sm text-gray-600">
        <div className="font-medium capitalize text-gray-700">{order.paymentMethod}</div>
        <div className="text-xs uppercase text-gray-400">{order.paymentStatus}</div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">
        <select
          value={statusDraft}
          onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          disabled={updating}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">{createdAt}</td>
      <td className="px-4 py-4 text-sm text-gray-600">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onUpdateStatus(order)}
            disabled={updating || statusDraft === order.status}
            className={`inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400`}
          >
            {updating ? t('actions.updating') : t('actions.update')}
          </button>
          <button
            type="button"
            onClick={() => onViewDetail(order.id)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            {t('actions.details')}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderRow;
