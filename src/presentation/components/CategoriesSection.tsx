import React from 'react';
import Image from 'next/image';
import { ProductCategory } from '@/domain/entities/Product';
import { ICONS } from '@/shared/constants/images';
import { CATEGORY_ICONS } from '@/shared/constants/categoryIcons';

const CategoriesSection: React.FC<{ categories: ProductCategory[] }> = ({ categories }) => {
  return (
    <section className="mb-8">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center min-w-[100px] cursor-pointer hover:opacity-80"
          >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                {(() => {
                  const candidate = CATEGORY_ICONS[category.slug ?? ''] ?? category.icon ?? ICONS.GOODS
                  const isImage = typeof candidate === 'string' && (candidate.startsWith('/') || candidate.startsWith('http') || candidate.startsWith('data:') || /\.(png|jpe?g|svg|gif|webp)(\?.*)?$/.test(candidate))
                  return isImage ? (
                    <Image src={candidate as string} alt={category.name} width={40} height={40} className="w-10 h-10" />
                  ) : (
                    <span className="text-2xl">{candidate}</span>
                  )
                })()}
            </div>
            <span className="text-sm text-gray-700">{category.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;