/**
 * KDS Data Factory
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { kdsApi } from './api-kds.adapter';
import { kdsMock } from './mock-kds.adapter';
import type { IKDSAdapter } from './kds-adapter.interface';

function createKdsAdapter(): IKDSAdapter {
  const useMock = isMockEnabled('kds');
  console.log('[KDSFactory] Mock enabled:', useMock);
  return useMock ? kdsMock : kdsApi;
}

/**
 * Singleton instance
 */
export const kdsAdapter = createKdsAdapter();
