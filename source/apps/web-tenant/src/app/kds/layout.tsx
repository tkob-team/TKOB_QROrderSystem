'use client';

import { KdsLayout } from '@/shared/components/layout/KdsLayout';

export default function KDSLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <KdsLayout>
      {children}
    </KdsLayout>
  );
}
