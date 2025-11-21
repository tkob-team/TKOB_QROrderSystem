import { Metadata } from 'next';
import { MenuViewPage } from '@/features/menu-view';

export const metadata: Metadata = {
  title: 'Menu | TKOB Order',
  description: 'Browse our menu and add items to your cart',
};

export default function Page() {
  return <MenuViewPage />;
}
