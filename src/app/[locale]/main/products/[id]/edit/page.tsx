'use client';

import { useParams } from 'next/navigation';
import ProductEditPage from '@/presentation/pages/ProductEditPage';

const ProductEditRoute = () => {
  const params = useParams() as { id?: string };
  const productId = params?.id ?? '';

  if (!productId) {
    return null;
  }

  return <ProductEditPage productId={productId} />;
};

export default ProductEditRoute;
