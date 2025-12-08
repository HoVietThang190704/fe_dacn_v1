import React from 'react';
import Image from 'next/image';
import { LivestreamProductSummary as Product } from '@/domain/entities/Livestream';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

interface Props {
  products: Product[];
  isLoading: boolean;
  error?: string | null;
  variant: 'grid' | 'list';
  formatPrice?: (p?: number) => string;
  livePricing?: Record<string, { livePrice?: number; remaining?: number | null }>;
  onSelect?: (product: Product) => void;
}

export const LivestreamProductList: React.FC<Props> = ({ products, isLoading, error, variant, formatPrice, livePricing, onSelect }) => {
  const t = useTranslations('livestream');
  if (!ICONS.GOODS) throw new Error('Missing icon: ICONS.GOODS');
  if (!ICONS.ARROW_RIGHT) throw new Error('Missing icon: ICONS.ARROW_RIGHT');
  const format = formatPrice || ((n = 0) => `${n.toLocaleString()}`);

  const getDisplayPricing = (product: Product) => {
    const pricing = livePricing?.[product.id];
    const rawRemaining = pricing?.remaining ?? null;
    const stock = typeof product.stockQuantity === 'number' ? product.stockQuantity : null;
    const remaining = rawRemaining != null && stock != null ? Math.min(rawRemaining, stock) : rawRemaining;
    const hasLive = pricing?.livePrice != null && (remaining == null || remaining > 0);
    return {
      hasLive,
      livePrice: pricing?.livePrice,
      remaining,
      stock,
    };
  };

  if (isLoading) {
    return <div className="text-sm text-gray-400 py-2">{t('watch.loadingProducts')}</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400 py-2">{t('watch.productsError')}</div>;
  }

  if (!products.length) {
    return <div className="text-sm text-gray-400 py-2">{t('watch.noProducts')}</div>;
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {products.map(product => (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect?.(product)}
            className="text-left bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition flex flex-col gap-2 w-full"
          >
            <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-600 relative">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt={product.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  <Image src={ICONS.GOODS} alt={t('productsAlt')} width={48} height={48} unoptimized />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-300">
                {(() => {
                  const { hasLive, livePrice } = getDisplayPricing(product);
                  if (hasLive && livePrice != null) {
                    return (
                      <>
                        <span className="text-purple-200 font-semibold mr-1">{format(livePrice)}</span>
                        <span className="text-gray-400 line-through">{format(product.price ?? 0)}</span>
                      </>
                    );
                  }
                  return format(product.price ?? 0);
                })()}
              </p>
              {getDisplayPricing(product).remaining != null && (
                <p className="text-[11px] text-emerald-300">{t('watch.remaining')}: {getDisplayPricing(product).remaining}</p>
              )}
              {typeof getDisplayPricing(product).stock === 'number' && (
                <p className="text-[11px] text-gray-300">Stock: {getDisplayPricing(product).stock}</p>
              )}
            </div>
            <span className="text-xs text-purple-300 font-medium mt-auto">{t('watch.viewProduct')}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
      {products.map(product => (
        <button
          key={product.id}
          type="button"
          onClick={() => onSelect?.(product)}
          className="w-full flex items-center gap-3 bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition text-left"
        >
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-600 relative flex-shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                <Image src={ICONS.GOODS} alt={t('productsAlt')} width={32} height={32} unoptimized className="object-contain" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <p className="text-xs text-gray-300 truncate">
              {(() => {
                const { hasLive, livePrice } = getDisplayPricing(product);
                if (hasLive && livePrice != null) {
                  return (
                    <>
                      <span className="text-purple-200 font-semibold mr-1">{format(livePrice)}</span>
                      <span className="text-gray-400 line-through">{format(product.price ?? 0)}</span>
                    </>
                  );
                }
                return format(product.price ?? 0);
              })()}
            </p>
            {getDisplayPricing(product).remaining != null && (
              <p className="text-[11px] text-emerald-300">{t('watch.remaining')}: {getDisplayPricing(product).remaining}</p>
            )}
            {typeof getDisplayPricing(product).stock === 'number' && (
              <p className="text-[11px] text-gray-300">Stock: {getDisplayPricing(product).stock}</p>
            )}
          </div>
          <Image src={ICONS.ARROW_RIGHT} alt={t('productsAlt')} width={16} height={16} className="w-4 h-4 text-gray-400 flex-shrink-0" unoptimized />
        </button>
      ))}
    </div>
  );
};

export default LivestreamProductList;
