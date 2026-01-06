/**
 * Staff Adapter Factory
 * DI container for staff data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IStaffAdapter } from './staff-adapter.interface';
import { MockStaffAdapter } from './mock-staff.adapter';
import { ApiStaffAdapter } from './api-staff.adapter';

function createStaffAdapter(): IStaffAdapter {
  const useMock = isMockEnabled('staff');
  console.log('[StaffFactory] Mock enabled:', useMock);
  if (useMock) {
    return new MockStaffAdapter();
  }
  return new ApiStaffAdapter(config.apiUrl);
}

export const staffAdapter = createStaffAdapter();
