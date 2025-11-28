import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { OrderManagementPage } from '@/features/order-management';

export const metadata: Metadata = {
  title: 'Orders | TKOB Admin',
  description: 'Manage and track restaurant orders',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['tenant-admin', 'manager']}>
      <OrderManagementPage />
    </RoleGuard>
  );
}
