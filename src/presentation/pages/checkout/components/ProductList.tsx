import Image from 'next/image';
import { memo } from 'react';
import { checkoutConfig } from '@/config/checkoutConfig';
import { TranslateFn } from '../types';

interface ProductItem {
  id: string;
  title?: string | null;
  thumbnail?: string | null;
  quantity?: number | null;
  price?: number | null;
  unit?: string | null;
}

interface ProductListProps {
  items: ProductItem[];
  t: TranslateFn;
  formatCurrency: (value: number) => string;
}

const { fallbackImage } = checkoutConfig;

export const ProductList = memo(({ items, t, formatCurrency }: ProductListProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('products.title')}</h2>
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
          <Image
            src={item.thumbnail || fallbackImage}
            alt={item.title || t('products.fallbackAlt')}
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            <div className="text-sm text-gray-500 mt-1">
              {t('products.quantity', { count: item.quantity })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-orange-500">
              {formatCurrency((item.price ?? 0) * (item.quantity || 0))}
            </div>
            <div className="text-sm text-gray-400">
              {t('products.pricePerUnit', {
                price: formatCurrency(item.price ?? 0),
                unit: item.unit ?? t('products.unitFallback'),
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

ProductList.displayName = 'ProductList';
