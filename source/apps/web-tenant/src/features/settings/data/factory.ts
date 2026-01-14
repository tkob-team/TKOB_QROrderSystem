/**
 * Settings Data Factory
 * Creates adapter instance (mock vs API) based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { apiSettingsAdapter } from './api/api-settings.adapter';
import { mockSettingsAdapter } from './mocks/mock-settings.adapter';
import type { SettingsAdapter } from './adapter.interface';

function createSettingsAdapter(): SettingsAdapter {
  const useMock = isMockEnabled('settings');
  return useMock ? mockSettingsAdapter : apiSettingsAdapter;
}

/**
 * Singleton instance
 */
export const settingsAdapter = createSettingsAdapter();
