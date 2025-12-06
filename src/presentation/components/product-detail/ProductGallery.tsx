"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/domain/entities/Product';
import { useTranslations } from 'next-intl';
import Icon from '@/presentation/components/ui/Icon';

type Props = {
  product: Product;
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  locale: string;
};

const ProductGallery: React.FC<Props> = ({ product, selectedIndex, onSelectIndex, locale }) => {
  const t = useTranslations('product');
  const tCard = useTranslations('productCard');

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.additionalImages && product.additionalImages.length > 0
      ? product.additionalImages
      : [product.image].filter(Boolean);

  const mainImage = images[selectedIndex] || images[0];

  return (
    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm p-6">
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-85 md:h-[28rem]">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-contain object-center" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">{t('noImage')}</div>
          )}
          <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.isAvailable ? t('inStock') : t('outOfStock')}
          </span>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, idx) => (
              <button key={img || idx} onClick={() => onSelectIndex(idx)} className={`relative w-16 h-16 rounded-md overflow-hidden border transition-all flex-shrink-0 ${selectedIndex === idx ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}>
                {img ? (
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">{t('noImage')}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {product.owner && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">{tCard('seller')}</p>
            <Link href={`/${locale}/main/users/${encodeURIComponent(product.owner.id)}?userName=${encodeURIComponent(product.owner.userName || '')}&email=${encodeURIComponent(product.owner.email || '')}&avatar=${encodeURIComponent(product.owner.avatar || '')}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group">
              <div className="flex-shrink-0">
                {product.owner.avatar ? (
                  <Image src={product.owner.avatar} alt={product.owner.userName || 'Seller'} width={48} height={48} className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-orange-200 transition-all" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    {(product.owner.userName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors truncate">{product.owner.userName || product.owner.email || tCard('unknownSeller')}</p>
                <p className="text-xs text-gray-500 truncate">{product.owner.email || tCard('notPublic') || t('notPublic')}</p>
              </div>
              <Icon name="ARROW_RIGHT" alt="arrow" className="w-4 h-4 text-gray-400 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
