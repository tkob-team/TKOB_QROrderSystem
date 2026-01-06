/**
 * Staff API Adapter
 * Real API implementation for staff data
 */

import type { IStaffAdapter } from './staff-adapter.interface';
import type { StaffMember, RoleOption } from '../model/types';

export class ApiStaffAdapter implements IStaffAdapter {
  constructor(private apiUrl: string) {}

  async getStaffMembers(): Promise<StaffMember[]> {
    // @todo implement API call to /staff
    throw new Error('ApiStaffAdapter.getStaffMembers not yet implemented');
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    // @todo implement API call to /staff/roles
    throw new Error('ApiStaffAdapter.getRoleOptions not yet implemented');
  }

  async addStaffMember(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    // @todo implement API call to POST /staff
    throw new Error('ApiStaffAdapter.addStaffMember not yet implemented');
  }

  async updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    // @todo implement API call to PATCH /staff/:id
    throw new Error('ApiStaffAdapter.updateStaffMember not yet implemented');
  }

  async deleteStaffMember(id: string): Promise<void> {
    // @todo implement API call to DELETE /staff/:id
    throw new Error('ApiStaffAdapter.deleteStaffMember not yet implemented');
  }
}
