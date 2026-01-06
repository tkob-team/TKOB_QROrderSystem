import { Metadata } from 'next';
import { RoleGuard } from '@/shared/guards';
import { OrdersPage } from '@/features/orders';

export const metadata: Metadata = {
  title: 'Orders | TKOB Admin',
  description: 'Manage and track restaurant orders',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <OrdersPage />
    </RoleGuard>
  );
}
