/**
 * Menu Data Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { menuApi } from './api-menu.adapter';
import { menuMock } from './mock-menu.adapter';
import type { IMenuAdapter } from './menu-adapter.interface';

function createMenuAdapter(): IMenuAdapter {
  const useMock = isMockEnabled('menu');
  console.log('[MenuFactory] Mock enabled:', useMock);
  return useMock ? menuMock : menuApi;
}

/**
 * Singleton instance
 */
export const menuAdapter = createMenuAdapter();
