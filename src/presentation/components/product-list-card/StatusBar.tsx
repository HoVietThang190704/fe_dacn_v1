import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import type { Product } from '@/domain/entities/Product';

type Props = {
  product: Product;
};

export default function StatusBar({ product }: Props) {
  const tCard = useTranslations('productCard');

  const soldCount = product.sold ?? 0;
  const stockCount = typeof product.stock === 'number' ? product.stock : typeof product.stockQuantity === 'number' ? product.stockQuantity : 0;
  const isInStock = product.inStock !== false && stockCount > 0;

  return (
    <div className={`flex items-center justify-between text-xs sm:text-sm ${isInStock ? 'text-gray-600' : 'text-red-600 font-semibold'}`}>
      {isInStock ? (
        <span>
          {tCard('available')}: <span className="font-semibold text-green-600">{stockCount}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Image src={ICONS.WARNING} alt={String(tCard('outOfStock'))} width={16} height={16} className="w-4 h-4" unoptimized />
          <span>{tCard('outOfStock')}</span>
        </span>
      )}

      <span>
        {tCard('sold')}: <span className="font-semibold text-blue-600">{soldCount}</span>
      </span>
    </div>
  );
}
