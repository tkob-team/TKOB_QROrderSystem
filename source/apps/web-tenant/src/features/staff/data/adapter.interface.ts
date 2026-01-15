/**
 * Staff Adapter Interface
 * Abstract contract for staff data operations
 */

import type { StaffMember, RoleOption, PendingInvitation, InviteStaffInput, UpdateStaffRoleInput } from '../model/types';

export interface InviteStaffResponse {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  message: string;
}

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
   * Get pending invitations
   */
  getPendingInvitations(): Promise<PendingInvitation[]>;

  /**
   * Invite new staff member (sends email)
   */
  inviteStaff(input: InviteStaffInput): Promise<InviteStaffResponse>;

  /**
   * Update existing staff member's role
   */
  updateStaffRole(staffId: string, input: UpdateStaffRoleInput): Promise<StaffMember>;

  /**
   * Remove staff member
   */
  removeStaff(staffId: string): Promise<void>;

  /**
   * Cancel pending invitation
   */
  cancelInvitation(invitationId: string): Promise<void>;

  /**
   * Resend invitation email
   */
  resendInvitation(invitationId: string): Promise<{ expiresAt: string }>;
}
