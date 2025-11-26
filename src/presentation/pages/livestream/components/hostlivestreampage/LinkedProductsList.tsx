import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { LivestreamProductSummary } from '@/domain/entities/Livestream';
 
import Icon from './Icon';

interface Props {
  products: LivestreamProductSummary[];
  isLoading: boolean;
  error?: string | null;
  formatter?: Intl.NumberFormat;
}

export const LinkedProductsList: React.FC<Props> = ({ products, isLoading, error, formatter }) => {
  const t = useTranslations('livestream');
  const localFormatter = React.useMemo(() => formatter ?? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }), [formatter]);

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
      {products.map(product => (
        <Link key={product.id} href={`/main/products/${product.id}`} className="flex items-center gap-3 bg-gray-700/60 hover:bg-gray-700 rounded-lg p-3 transition">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-600 relative flex-shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                <Icon name={('GOODS' as const)} alt={t('livestream.productsAlt') as string} width={40} height={40} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <p className="text-xs text-gray-300">{localFormatter.format(product.price ?? 0)}</p>
          </div>

          <Icon name={('ARROW_RIGHT' as const)} alt={t('livestream.back') as string} width={16} height={16} />
        </Link>
      ))}
    </div>
  );
};

export default LinkedProductsList;
