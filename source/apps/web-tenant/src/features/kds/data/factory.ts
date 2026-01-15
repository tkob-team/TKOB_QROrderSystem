/**
 * KDS Data Factory
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { logger } from '@/shared/utils/logger';
import { kdsApiAdapter } from './api/api-kds.adapter';
import { kdsMockAdapter } from './mocks/mock-kds.adapter';
import type { IKdsAdapter } from './adapter.interface';

function createKdsAdapter(): IKdsAdapter {
  const useMock = isMockEnabled('kds');
  
  if (typeof window !== 'undefined') {
    logger.info('[data] ADAPTER_MODE', { feature: 'kds', mode: useMock ? 'MOCK' : 'REAL_API' });
  }

  return useMock ? kdsMockAdapter : kdsApiAdapter;
}

/**
 * Singleton instance
 */
export const kdsAdapter = createKdsAdapter();
