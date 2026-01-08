/**
 * Staff Mock Adapter
 * Mock implementation for staff data
 */

import type { IStaffAdapter } from '../adapter.interface';
import type { StaffMember, RoleOption } from '../../model/types';
import { MOCK_ROLE_OPTIONS, MOCK_STAFF_MEMBERS } from './mock-staff.data';

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
    const newStaff = {
      ...staff,
      id: String(this.mockStaffMembers.length + 1),
    };
    this.mockStaffMembers.push(newStaff);
    return newStaff;
  }

  async updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    
    this.mockStaffMembers[index] = {
      ...this.mockStaffMembers[index],
      ...updates,
    };
    return this.mockStaffMembers[index];
  }

  async deleteStaffMember(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    this.mockStaffMembers.splice(index, 1);
  }
}
