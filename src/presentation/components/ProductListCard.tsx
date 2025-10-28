import React from 'react';
import Image from 'next/image';
import { Product } from '@/domain/entities/Product';

interface MockProduct extends Omit<Product, 'rating' | 'reviewCount' | 'description' | 'additionalImages' | 'brand' | 'origin'> {
  sold?: number;
}

const ProductListCard: React.FC<{
  product: MockProduct;
  router: { push: (path: string) => void };
  t: (key: string) => string;
}> = ({ product, router, t }) => {
  const handleClick = () => {
    router.push(`/main/products/${product.id}`);
  };

  return (
    <div className="bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
        {product.discount && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5">
            {product.discount}% GIẢM
          </div>
        )}
      </div>


      <div className="p-2">
        <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8 sm:h-10">{product.name}</h3>

        <div className="flex items-center gap-1 mb-1">
          <span className="text-orange-500 text-sm sm:text-base font-medium">
            ₫{product.price.toLocaleString('vi-VN')}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              {product.originalPrice.toLocaleString('vi-VN')}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {t('sold')} {product.sold || 0}
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;