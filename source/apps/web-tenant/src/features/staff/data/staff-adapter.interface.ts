/**
 * Staff Adapter Interface
 * Abstract contract for staff data operations
 */

import type { StaffMember, RoleOption } from '../model/types';

export interface IStaffAdapter {
  /**
   * Get all staff members
   */
  getStaffMembers(): Promise<StaffMember[]>;

  /**
   * Get role options for filtering/selection
   */
  getRoleOptions(): Promise<RoleOption[]>;

  /**
   * Add new staff member
   * @todo implement
   */
  addStaffMember(staff: Omit<StaffMember, 'id'>): Promise<StaffMember>;

  /**
   * Update existing staff member
   * @todo implement
   */
  updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember>;

  /**
   * Delete staff member
   * @todo implement
   */
  deleteStaffMember(id: string): Promise<void>;
}
