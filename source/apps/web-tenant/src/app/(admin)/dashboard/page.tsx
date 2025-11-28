import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { DashboardPage } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | TKOB Admin',
  description: 'Restaurant management dashboard with analytics and overview',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['tenant-admin', 'manager']}>
      <DashboardPage />
    </RoleGuard>
  );
}
