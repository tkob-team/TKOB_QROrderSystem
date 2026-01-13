/**
 * useAccountSettings - Internal Query Hook
 * Fetches account settings from adapter
 */

import { useEffect, useState } from 'react';
import { settingsAdapter } from '../../data/factory';
import type { AccountSettingsState } from '../../model/types';

export function useAccountSettings() {
  const [state, setState] = useState<AccountSettingsState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await settingsAdapter.getAccountSettings();
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
