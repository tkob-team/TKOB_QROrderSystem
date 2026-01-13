/**
 * useTenantProfileSettings - Internal Query Hook
 * Fetches tenant profile settings from adapter
 */

import { useEffect, useState } from 'react';
import { settingsAdapter } from '../../data/factory';
import type { TenantFullProfileState } from '../../model/types';

export function useTenantProfileSettings() {
  const [state, setState] = useState<TenantFullProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await settingsAdapter.getTenantProfileSettings();
        setState(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { state, isLoading, error, setState };
}
