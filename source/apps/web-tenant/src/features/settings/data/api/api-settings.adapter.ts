/**
 * Settings API Adapter
 * Placeholder for real API integration
 * Currently uses mock data; replace with actual API calls in production
 */

import type { SettingsAdapter } from '../adapter.interface';
import { mockSettingsAdapter } from '../mocks/mock-settings.adapter';

// For now, use mock adapter as fallback
export const apiSettingsAdapter: SettingsAdapter = mockSettingsAdapter;
