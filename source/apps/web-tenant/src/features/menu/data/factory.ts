/**
 * Menu Data Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { logger } from '@/shared/utils/logger';
import { menuApi } from './api/menuApi';
import { menuMock } from './mocks/menuMock';
import type { IMenuAdapter } from './adapter.interface';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';

function createMenuAdapter(): IMenuAdapter {
  const useMock = isMockEnabled('menu');
  if (logDataEnabled) {
    logger.info('[data] ADAPTER_MODE', { feature: 'menu', mode: useMock ? 'MOCK' : 'REAL_API' });
  }
  if (useMock) return menuMock as unknown as IMenuAdapter;
  // Adapt real API to IMenuAdapter contract where needed
  const adapted: IMenuAdapter = {
    ...menuApi,
    items: {
      ...menuApi.items,
      // Adapt signature: { isAvailable } -> { available }
      toggleAvailability: (id: string, data: { isAvailable: boolean }) =>
        (menuApi as any).items.toggleAvailability(id, { available: data.isAvailable }),
    } as any,
  } as unknown as IMenuAdapter;
  return adapted;
}

/**
 * Singleton instance
 */
export const menuAdapter = createMenuAdapter();
