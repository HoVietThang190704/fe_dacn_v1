import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { LivestreamProductSummary } from '@/domain/entities/Livestream';
 
import Icon from './Icon';

interface Props {
  products: LivestreamProductSummary[];
  isLoading: boolean;
  error?: string | null;
  formatter?: Intl.NumberFormat;
  livePricing?: Record<string, { livePrice?: number; remaining?: number | null }>;
}

export const LinkedProductsList: React.FC<Props> = ({ products, isLoading, error, formatter, livePricing }) => {
  const t = useTranslations('livestream');
  const localFormatter = React.useMemo(() => formatter ?? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }), [formatter]);

  const getDisplayPricing = (product: LivestreamProductSummary) => {
    const pricing = livePricing?.[product.id];
    const rawRemaining = pricing?.remaining ?? null;
    const stock = typeof product.stockQuantity === 'number' ? product.stockQuantity : null;
    const remaining = rawRemaining != null && stock != null ? Math.min(rawRemaining, stock) : rawRemaining;
    const hasLive = pricing?.livePrice != null && (remaining == null || remaining > 0);
    return { hasLive, livePrice: pricing?.livePrice, remaining, stock };
  };

  if (isLoading) {
    return <p className="text-sm text-gray-300">{t('host.productsLoading')}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{t('host.productsError')}</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-sm text-gray-400">{t('host.noProductsSelected')}</p>;
  }

  return (
    <div className="space-y-3">
      {products.map(product => {
        const { hasLive, livePrice, remaining, stock } = getDisplayPricing(product);
        return (
          <div key={product.id} className="flex items-center gap-3 bg-gray-700/60 rounded-lg p-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-600 relative flex-shrink-0">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt={product.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  <Icon name={('GOODS' as const)} alt={t('productsAlt') as string} width={40} height={40} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-300">
                {hasLive && livePrice != null ? (
                  <>
                    <span className="text-purple-200 font-semibold mr-1">{localFormatter.format(livePrice)}</span>
                    <span className="text-gray-400 line-through">{localFormatter.format(product.price ?? 0)}</span>
                  </>
                ) : (
                  localFormatter.format(product.price ?? 0)
                )}
              </p>
              {remaining != null && (
                <p className="text-[11px] text-emerald-300">{t('watch.remaining')}: {remaining}</p>
              )}
              {typeof stock === 'number' && (
                <p className="text-[11px] text-gray-300">Stock: {stock}</p>
              )}
            </div>

            <Icon name={('ARROW_RIGHT' as const)} alt={t('back') as string} width={16} height={16} />
          </div>
        );
      })}
    </div>
  );
};

export default LinkedProductsList;
