'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { translateSafely } from '../../utils/translate';
import { OrderStatus } from '@/domain/entities/Order';

export const OrdersEmptyState: React.FC<{ filterStatus: OrderStatus | 'ALL' }> = ({ filterStatus }) => {
  const t = useTranslations('orders');
  const isAll = filterStatus === 'ALL';
  const heading = isAll ? translateSafely(t, 'noOrders', 'Bạn chưa có đơn hàng nào') : translateSafely(t, 'noOrdersInFilter', 'Không có đơn phù hợp với bộ lọc');
  const body = isAll ? translateSafely(t, 'startShopping', 'Khám phá sản phẩm và đặt hàng ngay hôm nay') : translateSafely(t, 'emptyFilterHint', 'Hãy thử bộ lọc khác hoặc quay lại sau.');

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">📦</div>
      <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{heading}</h3>
      <p className="mt-2 text-sm text-gray-500 sm:text-base">{body}</p>
      {isAll && (
        <button className="mt-5 inline-flex items-center rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">{translateSafely(t, 'startShoppingCta', 'Bắt đầu mua sắm')}</button>
      )}
    </div>
  );
};

export default OrdersEmptyState;
