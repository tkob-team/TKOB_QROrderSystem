'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from './SessionContext';

// TODO: Import from @packages/dto when available
interface Table {
  id: string;
  name: string;
  tableNumber: string;
  floor?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
}

interface TableContextValue {
  table: Table | null;
  isLoading: boolean;
  error: Error | null;
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

interface TableProviderProps {
  children: ReactNode;
}

export function TableProvider({ children }: TableProviderProps) {
  const { tenantId, tableId } = useSession();

  const { data, isLoading, error } = useQuery<Table>({
    queryKey: ['table', tenantId, tableId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/public/tenants/${tenantId}/tables/${tableId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch table');
      }
      return res.json();
    },
    enabled: !!tenantId && !!tableId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  return (
    <TableContext.Provider
      value={{
        table: data ?? null,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within TableProvider');
  }
  return context;
}
