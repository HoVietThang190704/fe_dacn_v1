'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ICONS } from '@/shared/constants/images';
import { Order, OrderStatus, ORDER_STATUS } from '@/domain/entities/Order';
import { ORDER_CONFIG } from '../../config/orderConfig';
import { translateSafely, translateWithValues } from '../../utils/translate';
import useFormatCurrency from '../../hooks/useFormatCurrency';

const statusStyles: Record<OrderStatus, { labelKey: string; bg: string; text: string }> = {
  [ORDER_STATUS.PENDING]: { labelKey: 'status.pending', bg: 'bg-orange-50', text: 'text-orange-600' },
  [ORDER_STATUS.CONFIRMED]: { labelKey: 'status.confirmed', bg: 'bg-blue-50', text: 'text-blue-600' },
  [ORDER_STATUS.PREPARING]: { labelKey: 'status.preparing', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  [ORDER_STATUS.SHIPPING]: { labelKey: 'status.shipping', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  [ORDER_STATUS.DELIVERED]: { labelKey: 'status.delivered', bg: 'bg-gray-100', text: 'text-gray-700' },
  [ORDER_STATUS.CANCELLED]: { labelKey: 'status.cancelled', bg: 'bg-red-50', text: 'text-red-600' },
  [ORDER_STATUS.REFUNDED]: { labelKey: 'status.refunded', bg: 'bg-purple-50', text: 'text-purple-600' },
};

export const OrderCard: React.FC<{ order: Order; onViewDetail: () => void; onCancel: () => void; locale: string }> = ({ order, onViewDetail, onCancel, locale }) => {
  const t = useTranslations('orders');
  const tOrder = useTranslations('order');
  const tCommunity = useTranslations('community');
  const leadItem = order.items[0];
  const remainingItems = Math.max(0, order.totalItems - 1);
  const createdAtDisplay = order.createdAt ? new Date(order.createdAt).toLocaleString(locale) : '';

  const statusVariant = statusStyles[order.status];
  const statusLabel = translateSafely(t, statusVariant?.labelKey ?? order.status, order.statusDisplay ?? order.status);

  const paymentLabel = translateSafely(t, `payment.${order.paymentMethod}`, order.paymentMethod);

  const shippingAddress = order.shippingAddress?.fullAddress;
  const estimatedDelivery = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString(locale) : undefined;
  const estimatedLabel = estimatedDelivery
    ? translateWithValues(t, 'labels.estimatedDelivery', { date: estimatedDelivery })
    : undefined;
  const formatCurrency = useFormatCurrency(locale);

  const amountBreakdown = translateWithValues(
    t,
    'amountBreakdown',
    {
      subtotal: formatCurrency(order.subtotal),
      shipping: formatCurrency(order.shippingFee),
      discount: formatCurrency(order.discount),
    }
  );
  const cancelReason = order.cancelReason ? translateWithValues(t, 'labels.cancelReason', { reason: order.cancelReason }) : undefined;

  const cancellableStatuses: OrderStatus[] = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING];

  return (
    <article className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 sm:text-base">#{order.orderNumber}</p>
          <p className="text-xs text-gray-500 sm:text-sm">{createdAtDisplay}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${statusVariant?.bg ?? 'bg-gray-100'} ${statusVariant?.text ?? 'text-gray-700'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${ORDER_CONFIG.IMAGE_SIZE_CLASS}`}>
            {leadItem ? (
              <Image src={leadItem.productImage || ORDER_CONFIG.FALLBACK_IMAGE} alt={leadItem.productName} fill sizes={`${ORDER_CONFIG.IMAGE_WIDTH}px`} className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <Image src={ICONS.PLACEHOLDER} alt={translateSafely(t, 'labels.noProduct')} width={36} height={36} />
              </div>
            )}
            {remainingItems > 0 && (
              <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">{translateWithValues(tCommunity, 'moreImages', { count: remainingItems })}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-gray-900 sm:text-base">{leadItem?.productName ?? translateSafely(t, 'labels.noProduct')}</p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {leadItem ? `${tOrder('quantity')}: ${leadItem.quantity}` : ''}
              {remainingItems > 0 && ` (${order.totalItems} ${t('amountLabel').toLowerCase()})`}
            </p>
            {order.note && <p className="mt-1 truncate text-xs text-gray-400">{order.note}</p>}
          </div>
        </div>

        <div className="flex flex-none flex-col items-start gap-2 text-sm text-gray-500 sm:items-end">
          <div className="text-xs uppercase tracking-wide text-gray-400">{translateSafely(t, 'labels.total')}</div>
          <div className="text-lg font-semibold text-orange-500 sm:text-xl">{formatCurrency(order.total)}</div>
          <p className="text-xs text-gray-400 sm:text-sm">{amountBreakdown}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={onViewDetail} className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-600 sm:text-sm">{translateSafely(t, 'actions.details')}</button>
            {order.canBeCancelled && cancellableStatuses.includes(order.status) && (
              <button onClick={onCancel} className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 sm:text-sm">{translateSafely(t, 'actions.cancel')}</button>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-6 sm:text-sm">
        {shippingAddress && (
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              <Image src={ICONS.LOCATION} alt={translateSafely(t, 'order.shippingAddress')} width={18} height={18} />
            </div>
            <span className="line-clamp-2 sm:line-clamp-1">{shippingAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center">
            <Image src={ICONS.PAYMENT_METHOD} alt={translateSafely(t, 'order.paymentMethod')} width={18} height={18} />
          </div>
          <span>{paymentLabel}</span>
        </div>
        {estimatedLabel && (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              <Image src={ICONS.CALENDAR} alt={translateSafely(t, 'labels.estimatedDelivery')} width={18} height={18} />
            </div>
            <span>{estimatedLabel}</span>
          </div>
        )}
        {order.status === ORDER_STATUS.CANCELLED && cancelReason && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="flex h-5 w-5 items-center justify-center">
              <Image src={ICONS.WARNING} alt={translateSafely(t, 'dialog.warningAlt')} width={18} height={18} />
            </div>
            <span>{cancelReason}</span>
          </div>
        )}
      </footer>
    </article>
  );
};

export default OrderCard;
