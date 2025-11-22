import { memo } from 'react';
import { TranslateFn } from '../types';

interface OrderSummaryCardProps {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  formatCurrency: (value: number) => string;
  onSubmit: () => void;
  isProcessing: boolean;
  canSubmit: boolean;
  t: TranslateFn;
}

export const OrderSummaryCard = memo(({
  itemCount,
  subtotal,
  shippingFee,
  discount,
  total,
  formatCurrency,
  onSubmit,
  isProcessing,
  canSubmit,
  t,
}: OrderSummaryCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('summary.title')}</h2>

    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span>{t('summary.subtotalWithCount', { count: itemCount })}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex justify-between">
        <span>{t('shippingFee')}</span>
        <span>{formatCurrency(shippingFee)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>{t('summary.discount')}</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}

      <div className="border-t pt-3">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>{t('total')}</span>
          <span className="text-orange-500">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    <button
      onClick={onSubmit}
      disabled={isProcessing || !canSubmit}
      className="w-full mt-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isProcessing ? t('processing') : t('placeOrder')}
    </button>

    <p className="text-xs text-gray-500 text-center mt-3">{t('terms')}</p>
  </div>
));

OrderSummaryCard.displayName = 'OrderSummaryCard';
