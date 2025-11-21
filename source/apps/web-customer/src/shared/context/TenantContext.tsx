'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from './SessionContext';

// TODO: Import from @packages/dto when available
interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { tenantId } = useSession();

  const { data, isLoading, error } = useQuery<Tenant>({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/public/tenants/${tenantId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tenant');
      }
      return res.json();
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });

  return (
    <TenantContext.Provider
      value={{
        tenant: data ?? null,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
