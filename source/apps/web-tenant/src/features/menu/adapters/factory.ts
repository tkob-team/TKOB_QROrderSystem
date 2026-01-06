/**
 * Menu Adapter Factory
 * Switches between Mock and Real API based on environment
 */

import type { IMenuAdapter } from './types';
import { MenuApiAdapter } from './api';
import { MenuMockAdapter } from './mock';

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Get the menu adapter based on environment
 */
export const getMenuAdapter = (): IMenuAdapter => {
  if (useMockData) {
    console.log('🎭 [MenuAdapter] Using Mock Adapter');
    return new MenuMockAdapter();
  }
  console.log('🌐 [MenuAdapter] Using Real API Adapter');
  return new MenuApiAdapter();
};

/**
 * Singleton instance
 */
export const menuAdapter = getMenuAdapter();
