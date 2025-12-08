'use client';

import React from 'react';
import Image from 'next/image';
import { LivestreamProductSummary } from '@/domain/entities/Livestream';
import type { TranslateFn } from '@/presentation/types/translate';
import { ICONS } from '@/shared/constants/images';

interface ProductModalProps {
  product: LivestreamProductSummary;
  selectedQuantity: number;
  purchaseInfo: {
    maxAllowed: number;
    activeLivePrice?: number;
    remaining: number | null;
    stock: number | null | undefined;
    disableBuy: boolean;
  };
  currencyFormatter: (n: number) => string;
  onClose: () => void;
  updateQuantity: (delta: number) => void;
  onBuyNow: () => void;
  t: TranslateFn;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, selectedQuantity, purchaseInfo, currencyFormatter, onClose, updateQuantity, onBuyNow, t }) => {
  const { maxAllowed, activeLivePrice, remaining, stock, disableBuy } = purchaseInfo;
  const displayRemaining = remaining != null && stock != null ? Math.min(remaining, stock) : remaining;
  const disablePlus = selectedQuantity >= (isFinite(maxAllowed) ? maxAllowed : Number.MAX_SAFE_INTEGER);
  const unitPrice = activeLivePrice ?? product.price ?? 0;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 relative flex-shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image src={ICONS.GOODS} alt={t('productsAlt')} width={40} height={40} unoptimized />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate" title={product.name}>{product.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{t('watch.basePrice')}:</span>
                <span className={activeLivePrice ? 'line-through text-gray-500' : 'text-gray-200'}>{currencyFormatter(product.price ?? 0)}</span>
              </div>
              {activeLivePrice ? (
                <div className="flex items-center gap-2 text-purple-200 font-semibold">
                  <span>{t('watch.livePrice')}:</span>
                  <span>{currencyFormatter(activeLivePrice)}</span>
                </div>
              ) : null}
              {displayRemaining != null && (
                <div className="text-xs text-emerald-300">{t('watch.remaining')}: {displayRemaining}</div>
              )}
              {typeof product.stockQuantity === 'number' ? (
                <div className="text-xs text-gray-400">{product.stockQuantity > 0 ? t('watch.stockLeft', { count: product.stockQuantity }) : t('watch.outOfStock')}</div>
              ) : null}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label={t('watch.close')}>
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-300">{t('watch.quantity')}</p>
          <div className="inline-flex items-center bg-gray-800 rounded-lg border border-gray-700">
            <button
              type="button"
              onClick={() => updateQuantity(-1)}
              className="px-3 py-2 text-lg text-gray-200 hover:text-white disabled:opacity-50"
              disabled={selectedQuantity <= 1}
            >
              −
            </button>
            <span className="px-4 text-sm font-semibold">{selectedQuantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(1)}
              className="px-3 py-2 text-lg text-gray-200 hover:text-white disabled:opacity-50"
              disabled={disablePlus}
            >
              +
            </button>
          </div>
          {disableBuy && <p className="text-xs text-red-300 mt-1">{t('watch.outOfStock')}</p>}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-lg font-semibold text-purple-200">
            {currencyFormatter(unitPrice * selectedQuantity)}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
            >
              {t('watch.close')}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={disableBuy}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('watch.checkoutCta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
