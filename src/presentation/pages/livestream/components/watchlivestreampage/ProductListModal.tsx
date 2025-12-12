import React from 'react';
import Image from 'next/image';
import { LivestreamProductSummary } from '@/domain/entities/Livestream';
import { ICONS } from '@/shared/constants/images';
import LivestreamProductList from './LivestreamProductList';
import type { TranslateFn } from '@/presentation/types/translate';

interface ProductListModalProps {
  open: boolean;
  onClose: () => void;
  products: LivestreamProductSummary[];
  isLoading: boolean;
  error?: string | null;
  formatPrice: (p?: number) => string;
  livePricing?: Record<string, { livePrice?: number; remaining?: number | null }>;
  onSelect: (product: LivestreamProductSummary) => void;
  t: TranslateFn;
}

const ProductListModal: React.FC<ProductListModalProps> = ({
  open,
  onClose,
  products,
  isLoading,
  error,
  formatPrice,
  livePricing,
  onSelect,
  t,
}) => {
  if (!open) return null;
  if (!ICONS.GOODS) throw new Error('Missing icon: ICONS.GOODS');
  if (!ICONS.CROSS) throw new Error('Missing icon: ICONS.CROSS');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4 ">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src={ICONS.GOODS} alt={t('productsAlt')} width={24} height={24} className="w-6 h-6" unoptimized />
            <h3 className="text-lg font-semibold">{t('watch.products')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200"
            aria-label={t('watch.close')}
          >
            <Image src={ICONS.CROSS} alt={t('watch.close')} width={18} height={18} className="w-4 h-4" unoptimized />
          </button>
        </div>

        <div className="h-[60vh] overflow-hidden scrollbar-hide">
          <LivestreamProductList
            products={products}
            isLoading={isLoading}
            error={error}
            variant="list"
            formatPrice={formatPrice}
            livePricing={livePricing}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductListModal;
