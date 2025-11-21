'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionContextValue {
  tenantId: string | null;
  tableId: string | null;
  isSessionActive: boolean;
  setSession: (data: { tenantId: string; tableId: string; exp?: number }) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('customer-session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Check if session is expired
        if (data.exp && data.exp > Date.now() / 1000) {
          setTenantId(data.tenantId);
          setTableId(data.tableId);
        } else {
          localStorage.removeItem('customer-session');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('customer-session');
      }
    }
  }, []);

  const setSession = (data: { tenantId: string; tableId: string; exp?: number }) => {
    setTenantId(data.tenantId);
    setTableId(data.tableId);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer-session', JSON.stringify(data));
    }
  };

  const clearSession = () => {
    setTenantId(null);
    setTableId(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer-session');
    }
  };

  return (
    <SessionContext.Provider
      value={{
        tenantId,
        tableId,
        isSessionActive: !!tenantId && !!tableId,
        setSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
