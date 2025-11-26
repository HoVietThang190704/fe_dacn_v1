import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import useCurrency from '@/presentation/hooks/useCurrency';
import type { Product } from '@/domain/entities/Product';

type Props = {
  product: Product;
};

export default function PriceSection({ product }: Props) {
  const locale = useLocale();
  const tProducts = useTranslations('products');
  const { formatCurrency } = useCurrency();

  const priceLabel = typeof product.price === 'number' ? formatCurrency(product.price) : String(tProducts('contact'));
  const originalPriceLabel = typeof product.originalPrice === 'number' ? formatCurrency(product.originalPrice) : undefined;

  return (
    <div className="flex items-center gap-1 mb-2">
      <span className="text-orange-500 text-base sm:text-lg font-bold">{priceLabel}</span>
      {originalPriceLabel && (
        <span className="text-gray-400 text-xs line-through">{originalPriceLabel}</span>
      )}
    </div>
  );
}
