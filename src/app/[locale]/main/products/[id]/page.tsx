import { use } from 'react';
import { ProductDetailPage } from '@/presentation/pages';

interface ProductDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const { id } = use(params);
  return <ProductDetailPage />;
}