'use client';

import { ReactNode } from 'react';
import { ReactQueryProvider } from '@/shared/providers';
import { AuthProvider } from '@/shared/context/AuthContext';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ReactQueryProvider>
  );
}
