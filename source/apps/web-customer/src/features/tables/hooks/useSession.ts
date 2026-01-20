// Feature-owned useSession hook - Get current table session information
// Uses React Query for proper cache management and invalidation

import { useQuery } from '@tanstack/react-query';
import { USE_MOCK_API } from '@/shared/config';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { TableDataFactory } from '../data';
import type { SessionInfo } from '../data';
import { getStoredSession } from '../utils/sessionStorage';

// Query key for session - used for invalidation
export const sessionQueryKey = ['table-session'] as const;

export function useSession() {
  const { data: session, isLoading: loading, error: queryError, refetch } = useQuery<SessionInfo | null, Error>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      // In MOCK mode, try to read from localStorage first (client-side session)
      if (USE_MOCK_API) {
        const storedSession = getStoredSession();
        if (storedSession) {
          log('data', '[useSession] MOCK session loaded from storage', { 
            sessionId: maskId(storedSession.sessionId), 
            tableId: maskId(storedSession.tableId),
            billRequestedAt: storedSession.billRequestedAt || null,
          }, { feature: 'tables' });
          return storedSession;
        }
      }

      // Not found in storage or REAL mode: fetch from strategy
      const strategy = TableDataFactory.getStrategy();
      const sessionData = await strategy.getCurrentSession();
      
      log('data', '[useSession] Session data received', { 
        sessionId: sessionData?.sessionId ? maskId(sessionData.sessionId) : undefined, 
        tableId: sessionData?.tableId ? maskId(sessionData.tableId) : undefined,
        billRequestedAt: sessionData?.billRequestedAt || null,
      }, { feature: 'tables' });
      
      return sessionData;
    },
    staleTime: 0, // Always refetch when invalidated
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 1,
  });

  // Convert query error to Error type for backwards compatibility
  const error = queryError ? (queryError instanceof Error ? queryError : new Error('Failed to get session')) : null;

  return { session: session ?? null, loading, error, refetch };
}
