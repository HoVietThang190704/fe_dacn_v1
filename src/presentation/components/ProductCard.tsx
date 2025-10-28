import React from 'react';
import Image from 'next/image';
import { Product } from '@/domain/entities/Product';

interface MockProduct extends Omit<Product, 'rating' | 'reviewCount' | 'description' | 'additionalImages' | 'brand' | 'origin'> {
  sold?: number;
}

const ProductCard: React.FC<{ product: MockProduct }> = ({ product }) => {
  return (
    <div className="bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <h3 className="text-xs sm:text-sm mb-1 line-clamp-2 h-8">{product.name}</h3>
        
        <div className="flex items-center gap-1">
          <span className="text-orange-500 text-sm font-medium">
            ₫{(product.price * 20000).toLocaleString('vi-VN')}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">
              ₫{(product.originalPrice * 20000).toLocaleString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;