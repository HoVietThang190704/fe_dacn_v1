import { OrderDetailPage } from '@/presentation/pages';

type OrderDetailProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetail({ params }: OrderDetailProps) {
  const { orderId } = await params;
  return <OrderDetailPage orderId={orderId} />;
}