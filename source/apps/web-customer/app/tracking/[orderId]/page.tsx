import { Metadata } from 'next';
import { OrderTrackingPage } from '@/features/order-tracking';

export const metadata: Metadata = {
  title: 'Track Order | TKOB Order',
  description: 'Track your order status in real-time',
};

interface PageProps {
  params: {
    orderId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { orderId } = params;

  return <OrderTrackingPage orderId={orderId} />;
}
