/**
 * Staff Adapter Factory
 * DI container for staff data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IStaffAdapter } from './adapter.interface';
import { MockStaffAdapter } from './mocks/mock-staff.adapter';
import { ApiStaffAdapter } from './api/api-staff.adapter';

function createStaffAdapter(): IStaffAdapter {
  const useMock = isMockEnabled('staff');
  if (useMock) {
    return new MockStaffAdapter();
  }
  return new ApiStaffAdapter(config.apiUrl);
}

export const staffAdapter = createStaffAdapter();
