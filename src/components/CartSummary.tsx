import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFormatCurrency } from '@/lib/utils';

interface CartSummaryProps {
  selectedQuantity: number;
  selectedSubtotal: number;
  subtotal: number;
  selectedIdsSize: number;
  isMutating: boolean;
}

export function CartSummary({ selectedQuantity, selectedSubtotal, subtotal, selectedIdsSize, isMutating }: CartSummaryProps) {
  const t = useTranslations('cart');
  const router = useRouter();
  const formatCurrency = useFormatCurrency();

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit self-start">
      <h2 className="text-lg font-semibold text-gray-900">{t('summaryTitle')}</h2>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>{t('itemsSelected')}</span>
          <span className="font-medium text-gray-800">{selectedQuantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t('itemsTotal')}</span>
          <span className="font-medium text-gray-800">{formatCurrency(selectedSubtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t('cartSubtotal')}</span>
          <span className="font-semibold text-orange-500">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/main/checkout')}
        disabled={selectedIdsSize === 0 || isMutating}
        className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
      >
        {t('checkout')}
      </button>
      <p className="text-xs text-gray-400 text-center">{t('checkoutNote')}</p>
    </aside>
  );
}