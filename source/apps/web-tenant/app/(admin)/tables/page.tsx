import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { TablesPage } from '@/features/tables';

export const metadata: Metadata = {
  title: 'Table Management | TKOB Admin',
  description: 'Manage restaurant tables and generate QR codes',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['tenant-admin', 'manager']}>
      <TablesPage />
    </RoleGuard>
  );
}
