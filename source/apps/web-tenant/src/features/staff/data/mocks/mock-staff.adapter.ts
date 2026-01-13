/**
 * Staff Mock Adapter
 * Mock implementation for staff data
 */

import type { IStaffAdapter } from '../adapter.interface';
import type { StaffMember, RoleOption } from '../../model/types';
import { MOCK_ROLE_OPTIONS, MOCK_STAFF_MEMBERS } from './mock-staff.data';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

export class MockStaffAdapter implements IStaffAdapter {
  // Local mutable copies so adapter methods can modify without mutating exported constants
  private roleOptions: RoleOption[] = [...MOCK_ROLE_OPTIONS];
  private mockStaffMembers: StaffMember[] = [...MOCK_STAFF_MEMBERS];

  async getStaffMembers(): Promise<StaffMember[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockStaffMembers;
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.roleOptions;
  }

  async addStaffMember(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.create',
        payload: samplePayload(staff),
      });
    }
    const newStaff = {
      ...staff,
      id: String(this.mockStaffMembers.length + 1),
    };
    this.mockStaffMembers.push(newStaff);
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'staff',
        op: 'staff.create',
        data: samplePayload(newStaff),
      });
    }
    return newStaff;
  }

  async updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.update',
        payload: samplePayload({ id, ...updates }),
      });
    }
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    
    this.mockStaffMembers[index] = {
      ...this.mockStaffMembers[index],
      ...updates,
    };
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'staff',
        op: 'staff.update',
        data: samplePayload(this.mockStaffMembers[index]),
      });
    }
    return this.mockStaffMembers[index];
  }

  async deleteStaffMember(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.delete',
        payload: samplePayload({ id }),
      });
    }
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    this.mockStaffMembers.splice(index, 1);
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'staff',
        op: 'staff.delete',
        data: samplePayload({ success: true }),
      });
    }
  }
}
