'use client';

import { ReactNode } from 'react';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import { SessionProvider } from '@/shared/context/SessionContext';
import { TenantProvider } from '@/shared/context/TenantContext';
import { TableProvider } from '@/shared/context/TableContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <TenantProvider>
          <TableProvider>
            {children}
          </TableProvider>
        </TenantProvider>
      </SessionProvider>
    </ReactQueryProvider>
  );
}
