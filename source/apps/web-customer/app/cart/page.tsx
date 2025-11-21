import { Metadata } from 'next';
import { CartPage } from '@/features/cart';

export const metadata: Metadata = {
  title: 'Cart | TKOB Order',
  description: 'Review your order and proceed to checkout',
};

export default function Page() {
  return <CartPage />;
}
