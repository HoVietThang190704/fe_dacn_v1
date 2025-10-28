import { OrderDetailPage } from '@/presentation/pages';

interface OrderDetailProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetail({ params }: OrderDetailProps) {
  return <OrderDetailPage orderId={params.orderId} />;
}