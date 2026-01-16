/**
 * Staff API Adapter
 * Real API implementation for staff data
 */

import { api } from '@/services/axios';
import type { IStaffAdapter, InviteStaffResponse } from '../adapter.interface';
import type {
  StaffMember,
  RoleOption,
  PendingInvitation,
  InviteStaffInput,
  UpdateStaffRoleInput,
} from '../../model/types';
import { ChefHat, User } from 'lucide-react';

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'OWNER',
    icon: User,
    label: 'Owner',
    description: 'Full access to all features',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    role: 'STAFF',
    icon: User,
    label: 'Staff',
    description: 'Can manage orders and tables',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    role: 'KITCHEN',
    icon: ChefHat,
    label: 'Kitchen',
    description: 'Can view and manage KDS',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
];

export class ApiStaffAdapter implements IStaffAdapter {
  async getStaffMembers(): Promise<StaffMember[]> {
    try {
      const response = await api.get<{ success: boolean; data: { staff: StaffMember[]; total: number } }>('/api/v1/admin/staff');
      return response.data?.data?.staff || [];
    } catch (error) {
      console.error('[staff] Failed to fetch staff members:', error);
      return [];
    }
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    return ROLE_OPTIONS;
  }

  async getPendingInvitations(): Promise<PendingInvitation[]> {
    try {
      const response = await api.get<{ success: boolean; data: { invitations: PendingInvitation[]; total: number } }>(
        '/api/v1/admin/staff/invitations'
      );
      console.log('[staff] getPendingInvitations response:', JSON.stringify(response.data, null, 2));
      return response.data?.data?.invitations || [];
    } catch (error) {
      console.error('[staff] Failed to fetch pending invitations:', error);
      return [];
    }
  }

  async inviteStaff(input: InviteStaffInput): Promise<InviteStaffResponse> {
    const response = await api.post<InviteStaffResponse>('/api/v1/admin/staff/invite', input);
    return response.data;
  }

  async updateStaffRole(staffId: string, input: UpdateStaffRoleInput): Promise<StaffMember> {
    const response = await api.patch<StaffMember>(`/api/v1/admin/staff/${staffId}/role`, input);
    return response.data;
  }

  async removeStaff(staffId: string): Promise<void> {
    await api.delete(`/api/v1/admin/staff/${staffId}`);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await api.delete(`/api/v1/admin/staff/invitations/${invitationId}`);
  }

  async resendInvitation(invitationId: string): Promise<{ expiresAt: string }> {
    const response = await api.post<{ message: string; expiresAt: string }>(
      `/api/v1/admin/staff/invitations/${invitationId}/resend`
    );
    return { expiresAt: response.data.expiresAt };
  }
}
