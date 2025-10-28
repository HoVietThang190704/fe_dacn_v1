import { ProductDetailPage } from '@/presentation/pages';

interface ProductDetailProps {
  params: {
    id: string;
  };
}

export default function ProductDetail({ params }: ProductDetailProps) {
  return <ProductDetailPage productId={params.id} />;
}