import React from 'react';
import { Livestream, LivestreamProductSummary } from '@/domain/entities/Livestream';
import type { TranslateFn } from '@/presentation/types/translate';
import LinkedProductsList from './LinkedProductsList';
import PricingEditor from './PricingEditor';

interface LivePricingModalProps {
  open: boolean;
  onClose: () => void;
  linkedProducts: LivestreamProductSummary[];
  isLoadingLinkedProducts: boolean;
  linkedProductsError?: string | null;
  livePricing?: Record<string, { livePrice?: number; remaining?: number | null }>;
  pricingDraft: Record<string, { livePrice: string; maxQuantity: string }>;
  handlePricingChange: (productId: string, field: 'livePrice' | 'maxQuantity', value: string) => void;
  handleSavePricing: () => Promise<void> | void;
  isSavingPricing: boolean;
  pricingMessage: string;
  priceFormatter: (n: number) => string;
  priceDisplayFormatter: Intl.NumberFormat;
  livestream?: Livestream | null;
  t: TranslateFn;
}

const LivePricingModal: React.FC<LivePricingModalProps> = ({
  open,
  onClose,
  linkedProducts,
  isLoadingLinkedProducts,
  linkedProductsError,
  livePricing,
  pricingDraft,
  handlePricingChange,
  handleSavePricing,
  isSavingPricing,
  pricingMessage,
  priceFormatter,
  priceDisplayFormatter,
  livestream,
  t,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 sm:px-6">
      <style>{`.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-800 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{t('host.livePricingTitle')}</h3>
            <p className="text-xs text-gray-400">{t('host.livePricingHelper')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700"
            aria-label="Close pricing modal"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="grid gap-4 p-2 lg:grid-cols-[30%_70%] overflow-y-auto overflow-x-hidden max-h-[80vh] no-scrollbar">
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">{t('host.linkedProducts')}</h4>
                <p className="text-xs text-gray-400">{t('host.linkedProductsHelper')}</p>
              </div>
              <span className="text-sm text-gray-300 font-medium">{linkedProducts.length}</span>
            </div>
            <LinkedProductsList
              products={linkedProducts}
              isLoading={isLoadingLinkedProducts}
              error={linkedProductsError}
              formatter={priceDisplayFormatter}
              livePricing={livePricing}
            />
          </div>

          <PricingEditor
            livestream={livestream}
            linkedProducts={linkedProducts}
            pricingDraft={pricingDraft}
            handlePricingChange={handlePricingChange}
            handleSavePricing={handleSavePricing}
            isSavingPricing={isSavingPricing}
            pricingMessage={pricingMessage}
            priceFormatter={priceFormatter}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default LivePricingModal;
