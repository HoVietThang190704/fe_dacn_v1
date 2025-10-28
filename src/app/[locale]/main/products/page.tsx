'use client';

import { ProductsListPage } from '@/presentation/pages';
import { container } from '@/presentation/di/container';
import { useEffect, useState } from 'react';
import { ProductCategory } from '@/domain/entities/Product';

export default function ProductsPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await container.productRepository.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
  //     </div>
  //   );
  // }

  return <ProductsListPage categories={categories} />;
}
