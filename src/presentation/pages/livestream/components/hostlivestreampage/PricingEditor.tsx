'use client';

import React from 'react';
import { Livestream } from '@/domain/entities/Livestream';
import type { TranslateFn } from '@/presentation/types/translate';

interface PricingEditorProps {
  livestream?: Livestream | null;
  linkedProducts: { id: string; name: string; price?: number; stockQuantity?: number }[];
  pricingDraft: Record<string, { livePrice: string; maxQuantity: string }>;
  handlePricingChange: (productId: string, field: 'livePrice' | 'maxQuantity', value: string) => void;
  handleSavePricing: () => Promise<void> | void;
  isSavingPricing: boolean;
  pricingMessage: string;
  priceFormatter: (n: number) => string;
  t: TranslateFn;
}

const PricingEditor: React.FC<PricingEditorProps> = ({ livestream, linkedProducts, pricingDraft, handlePricingChange, handleSavePricing, isSavingPricing, pricingMessage, priceFormatter, t }) => {
  if (!linkedProducts.length) return null;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{t('host.livePricingTitle')}</h3>
          <p className="text-xs text-gray-400">{t('host.livePricingHelper')}</p>
        </div>
        {pricingMessage && <span className="text-xs text-gray-300">{pricingMessage}</span>}
      </div>

      <div className="space-y-3">
        {linkedProducts.map((product) => {
          const draft = pricingDraft[product.id] ?? { livePrice: '', maxQuantity: '' };
          const existing = livestream?.productPricing?.find((pricing) => pricing.productId === product.id);
          const remaining = existing?.maxQuantity != null
            ? Math.max(existing.maxQuantity - (existing.claimedQuantity ?? 0), 0)
            : null;

          return (
            <div key={product.id} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-gray-400">
                    {t('host.basePriceLabel')}: {product.price ? priceFormatter(product.price) : '—'}
                  </p>
                  {typeof product.stockQuantity === 'number' && (
                    <p className="text-[11px] text-gray-300">Stock: {product.stockQuantity}</p>
                  )}
                </div>
                {remaining !== null && (
                  <span className="text-xs text-emerald-300">
                    {t('host.remainingLabel')}: {remaining}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400" htmlFor={`livePrice-${product.id}`}>
                    {t('host.livePriceLabel')}
                  </label>
                  <input
                    id={`livePrice-${product.id}`}
                    type="number"
                    min="0"
                    value={draft.livePrice}
                    placeholder={t('host.livePricePlaceholder')}
                    onChange={(e) => handlePricingChange(product.id, 'livePrice', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400" htmlFor={`limit-${product.id}`}>
                    {t('host.limitLabel')}
                  </label>
                  <input
                    id={`limit-${product.id}`}
                    type="number"
                    min="0"
                    value={draft.maxQuantity}
                    placeholder={t('host.limitPlaceholder')}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (typeof product.stockQuantity === 'number') {
                        const num = Number(val);
                        if (!Number.isNaN(num)) {
                          const clamped = Math.max(0, Math.min(num, product.stockQuantity as number));
                          val = String(clamped);
                        }
                      }
                      handlePricingChange(product.id, 'maxQuantity', val);
                    }}
                    max={typeof product.stockQuantity === 'number' ? product.stockQuantity : undefined}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleSavePricing()}
          disabled={isSavingPricing}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition"
        >
          {isSavingPricing ? t('host.savingPricing') : t('host.savePricing')}
        </button>
      </div>
    </div>
  );
};

export default PricingEditor;
