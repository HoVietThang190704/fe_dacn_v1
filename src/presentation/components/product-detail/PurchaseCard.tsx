"use client";
import React from 'react';
import { Product } from '@/domain/entities/Product';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/presentation/lib/formatters';
import Icon from '@/presentation/components/ui/Icon';

type Props = {
  product: Product;
  stockCount: number;
  quantity: number;
  increment: () => void;
  decrement: () => void;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => void;
  isAdding?: boolean;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: () => void;
  locale: string;
};

const PurchaseCard: React.FC<Props> = ({ product, stockCount, quantity, increment, decrement, onAddToCart, onBuyNow, isAdding, isFavorite, isFavoriteLoading, onToggleFavorite }) => {
  const t = useTranslations('product');

  const isProductAvailable = product.inStock !== false && stockCount > 0;

  return (
    <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{t('labelProduct') || t('product')}</span>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{t('skuLabel')}: <strong className="text-gray-700">{product.id}</strong></span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isFavorite ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            disabled={isFavoriteLoading}
          >
            <Icon name={isFavorite ? 'HEART_SELECT' : 'HEART'} alt={isFavorite ? 'favorited' : 'favorite'} className={`w-4 h-4 ${isFavorite ? '' : 'opacity-80'}`} />
          </button>
          <div className="flex items-center justify-end gap-2 text-lg font-semibold text-orange-500">
            <span>{(product.rating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <p className="text-3xl md:text-4xl font-bold text-emerald-600">{formatCurrency(product.price)}</p>
          {product.originalPrice && (<p className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</p>)}
        </div>
        {product.originalPrice && (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold">{t('savings', { amount: formatCurrency((product.originalPrice || 0) - (product.price || 0)) })}</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isProductAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${isProductAvailable ? 'text-emerald-600' : 'text-red-600'}`}>{isProductAvailable ? t('inStock') : t('outOfStock')}</span>
        </div>

        <div className="border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between bg-gray-50">
          <div>
            <p className="text-sm text-gray-500">{t('quantity') || 'Quantity'}</p>
            <p className="text-xs text-gray-400">{t('maxQuantity', { count: stockCount })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={decrement} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600 hover:bg-white"><Icon name="MINUS" alt="decrease" className="w-4 h-4" /></button>
            <span className="w-10 text-center font-semibold text-gray-700">{quantity}</span>
            <button onClick={increment} className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg transition-colors ${isProductAvailable && quantity < stockCount ? 'text-gray-600 hover:bg-white' : 'text-gray-400 cursor-not-allowed bg-gray-100'}`} disabled={!isProductAvailable || quantity >= stockCount}><Icon name="PLUS" alt="increase" className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onAddToCart} className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!isProductAvailable || isAdding}>{isAdding ? t('adding') : t('addToCart')}</button>
        <button onClick={onBuyNow} className="py-3 rounded-xl border border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!isProductAvailable}>{t('buyNow')}</button>
      </div>
    </section>
  );
};

export default PurchaseCard;
