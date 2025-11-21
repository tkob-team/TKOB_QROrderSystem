import { Metadata } from 'next';
import { CheckoutPage } from '@/features/checkout';

export const metadata: Metadata = {
  title: 'Checkout | TKOB Order',
  description: 'Complete your order',
};

export default function Page() {
  return <CheckoutPage />;
}
