import React from 'react';
import { Product } from '@/domain/entities/Product';
import ProductCard from './ProductCard';

const ProductSection: React.FC<{ title: string; products: Product[]; t: (key: string) => string }> = ({
  title,
  products,
  t,
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <a href="#" className="text-green-600 hover:underline">
          {t('seeAll')}
        </a>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;