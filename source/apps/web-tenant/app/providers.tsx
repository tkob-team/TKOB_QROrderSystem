'use client';

import { ReactNode } from 'react';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import { AuthProvider } from '@/shared/context/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  );
}
