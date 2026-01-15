/**
 * Staff Mock Adapter
 * Mock implementation for staff data
 */

import type { IStaffAdapter, InviteStaffResponse } from '../adapter.interface';
import type {
  StaffMember,
  RoleOption,
  PendingInvitation,
  InviteStaffInput,
  UpdateStaffRoleInput,
} from '../../model/types';
import { MOCK_ROLE_OPTIONS, MOCK_STAFF_MEMBERS } from './mock-staff.data';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

const MOCK_INVITATIONS: PendingInvitation[] = [
  {
    id: 'inv-1',
    email: 'newchef@restaurant.com',
    role: 'KITCHEN',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export class MockStaffAdapter implements IStaffAdapter {
  private roleOptions: RoleOption[] = [...MOCK_ROLE_OPTIONS];
  private mockStaffMembers: StaffMember[] = [...MOCK_STAFF_MEMBERS];
  private mockInvitations: PendingInvitation[] = [...MOCK_INVITATIONS];

  async getStaffMembers(): Promise<StaffMember[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockStaffMembers;
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.roleOptions;
  }

  async getPendingInvitations(): Promise<PendingInvitation[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.mockInvitations;
  }

  async inviteStaff(input: InviteStaffInput): Promise<InviteStaffResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.invite',
        payload: samplePayload(input),
      });
    }

    const newInvitation: PendingInvitation = {
      id: `inv-${Date.now()}`,
      email: input.email,
      role: input.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.mockInvitations.push(newInvitation);

    return {
      id: newInvitation.id,
      email: newInvitation.email,
      role: newInvitation.role,
      expiresAt: newInvitation.expiresAt,
      message: `Invitation sent to ${input.email}. They have 7 days to accept.`,
    };
  }

  async updateStaffRole(staffId: string, input: UpdateStaffRoleInput): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.updateRole',
        payload: samplePayload({ staffId, ...input }),
      });
    }

    const index = this.mockStaffMembers.findIndex((s) => s.id === staffId);
    if (index === -1) throw new Error('Staff member not found');

    this.mockStaffMembers[index] = {
      ...this.mockStaffMembers[index],
      role: input.role,
    };

    return this.mockStaffMembers[index];
  }

  async removeStaff(staffId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'staff',
        op: 'staff.remove',
        payload: samplePayload({ staffId }),
      });
    }

    const index = this.mockStaffMembers.findIndex((s) => s.id === staffId);
    if (index === -1) throw new Error('Staff member not found');
    this.mockStaffMembers.splice(index, 1);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.mockInvitations.findIndex((i) => i.id === invitationId);
    if (index === -1) throw new Error('Invitation not found');
    this.mockInvitations.splice(index, 1);
  }

  async resendInvitation(invitationId: string): Promise<{ expiresAt: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const invitation = this.mockInvitations.find((i) => i.id === invitationId);
    if (!invitation) throw new Error('Invitation not found');

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    invitation.expiresAt = newExpiresAt;

    return { expiresAt: newExpiresAt };
  }
}
