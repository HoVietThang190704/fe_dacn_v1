import React from 'react';
import type { Product } from '@/domain/entities/Product';
import ProductCard from '@/presentation/components/ProductCard';
import { useTranslations } from 'next-intl';

interface ProductSectionProps {
  products: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

const ProductsSection: React.FC<ProductSectionProps> = ({ products, hasMore, onLoadMore, total }) => {
  const t = useTranslations('search');

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{t('results.products', { count: total })}</h2>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">{t('results.noProductsDesc')}</p>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 border rounded"
          >
            {t('results.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
