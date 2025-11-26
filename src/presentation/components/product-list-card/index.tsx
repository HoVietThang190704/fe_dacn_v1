import React from 'react';
import ProductThumbnail from './ProductThumbnail';
import PriceSection from './PriceSection';
import StatusBar from './StatusBar';
import { useTranslations, useLocale } from 'next-intl';
import { ICONS } from '@/shared/constants/images';
import Image from 'next/image';
import type { Product } from '@/domain/entities/Product';

type RouterLike = { push: (path: string) => void } | undefined;

type Props = {
  product: Product;
  router?: RouterLike;
};

export default function ProductListCard({ product, router }: Props) {
  const tCard = useTranslations('productCard');
  const tProducts = useTranslations('products');
  const locale = useLocale();

  const handleClick = () => {
    if (router && typeof router.push === 'function') {
      router.push(`/${locale}/main/products/${product.id}`);
      return;
    }
    // best-effort client navigation — let parent handle routing in server components
  };

  const sellerName = product.owner?.userName || product.owner?.email || String(tCard('seller'));

  return (
    <div
      className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-100 rounded-lg overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative">
        <ProductThumbnail product={product} alt={product.name} />

        {product.discount && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-2">
            <Image src={ICONS.THUNDER} alt={String(tCard('discountLabel', { discount: product.discount }))} width={16} height={16} unoptimized className="w-4 h-4" />
            <span>{tCard('discountLabel', { discount: product.discount })}</span>
          </div>
        )}

        {product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0) ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{tCard('outOfStock')}</span>
          </div>
        ) : null}
      </div>

      <div className="p-2.5">
        <h3 className="text-sm sm:text-base mb-2 line-clamp-2 font-semibold text-gray-800 leading-tight" style={{ minHeight: '1rem' }}>
          {product.name}
        </h3>

        <PriceSection product={product} />

        <div className="text-sm text-gray-700 mb-1.5 truncate">
          <span className="font-medium">{sellerName}</span>
        </div>

        <StatusBar product={product} />
      </div>
    </div>
  );
}
