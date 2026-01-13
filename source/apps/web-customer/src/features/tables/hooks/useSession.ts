// Feature-owned useSession hook - Get current table session information

import { useState, useEffect } from 'react';
import { USE_MOCK_API } from '@/shared/config';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { TableDataFactory } from '../data';
import type { SessionInfo } from '../data';
import { getStoredSession } from '../utils/sessionStorage';

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSession() {
      try {
        setLoading(true);

        // In MOCK mode, try to read from localStorage first (client-side session)
        if (USE_MOCK_API) {
          const storedSession = getStoredSession();
          if (storedSession) {
            log('data', '[useSession] MOCK session loaded from storage', { sessionId: maskId(storedSession.sessionId), tableId: maskId(storedSession.tableId) }, { feature: 'tables' });
            if (mounted) {
              setSession(storedSession);
              setError(null);
              setLoading(false);
            }
            return;
          }
        }

        // Not found in storage or REAL mode: fetch from strategy
        const strategy = TableDataFactory.getStrategy();
        const sessionData = await strategy.getCurrentSession();
        
        log('data', '[useSession] Session data received', { sessionId: sessionData?.sessionId ? maskId(sessionData.sessionId) : undefined, tableId: sessionData?.tableId ? maskId(sessionData.tableId) : undefined }, { feature: 'tables' });
        
        if (mounted) {
          setSession(sessionData);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          logError('data', '[useSession] Failed to get session', err, { feature: 'tables' });
          setSession(null);
          setError(err instanceof Error ? err : new Error('Failed to get session'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  return { session, loading, error };
}
