// Hook to get current table session information

import { useState, useEffect } from 'react';
import { TableService, SessionInfo } from '@/api/services/table.service';

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSession() {
      try {
        setLoading(true);
        const sessionData = await TableService.getCurrentSession();
        
        console.log('[useSession] Session data received:', sessionData);
        
        if (mounted) {
          setSession(sessionData);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('[useSession] Failed to get session:', err);
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
