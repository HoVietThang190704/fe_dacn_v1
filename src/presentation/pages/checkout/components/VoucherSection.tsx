import { memo } from 'react';
import { VoucherInfo, TranslateFn } from '../types';

interface VoucherSectionProps {
  appliedVoucher: VoucherInfo | null;
  voucherCode: string;
  onVoucherCodeChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  isApplying: boolean;
  formatCurrency: (value: number) => string;
  t: TranslateFn;
}

export const VoucherSection = memo(({
  appliedVoucher,
  voucherCode,
  onVoucherCodeChange,
  onApply,
  onRemove,
  isApplying,
  formatCurrency,
  t,
}: VoucherSectionProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('voucher.title')}</h2>
    {appliedVoucher ? (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✓</div>
          <div>
            <div className="font-medium text-green-700">{appliedVoucher.voucher.code || appliedVoucher.code}</div>
            <div className="text-sm text-green-600">
              {t('voucher.appliedDiscount', { amount: formatCurrency(appliedVoucher.discount) })}
            </div>
          </div>
        </div>
        <button onClick={onRemove} className="text-sm text-red-500 hover:text-red-600">
          {t('voucher.remove')}
        </button>
      </div>
    ) : (
      <div className="flex gap-2">
        <input
          type="text"
          value={voucherCode}
          onChange={(e) => onVoucherCodeChange(e.target.value)}
          placeholder={t('voucher.placeholder')}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          onClick={onApply}
          disabled={!voucherCode.trim() || isApplying}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? t('voucher.applying') : t('voucher.apply')}
        </button>
      </div>
    )}
  </div>
));

VoucherSection.displayName = 'VoucherSection';
