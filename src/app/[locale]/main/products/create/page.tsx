'use client';

import { useEffect, useState } from 'react';
import { ProductCategory } from '@/domain/entities/Product';
import { container } from '@/presentation/di/container';
import { ProductCreatePage } from '@/presentation/pages/ProductCreatePage';

const ProductCreateRoute = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await container.productRepository.getCategories();
        // Debug: log categories received from repository
        try {
          console.debug('[ProductCreateRoute] loaded categories count:', items.length, items.slice(0, 6));
        } catch {}
        setCategories(items);
      } catch (error) {
        console.error('Failed to load categories for create product page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ProductCreatePage categories={categories} />;
};

export default ProductCreateRoute;
