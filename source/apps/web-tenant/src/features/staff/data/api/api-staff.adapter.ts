/**
 * Staff API Adapter
 * Real API implementation for staff data
 */

import axios from 'axios';
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
  private api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    withCredentials: true,
  });

  constructor() {
    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getStaffMembers(): Promise<StaffMember[]> {
    const response = await this.api.get<{ staff: StaffMember[]; total: number }>('/admin/staff');
    return response.data.staff;
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    return ROLE_OPTIONS;
  }

  async getPendingInvitations(): Promise<PendingInvitation[]> {
    const response = await this.api.get<{ invitations: PendingInvitation[]; total: number }>(
      '/admin/staff/invitations'
    );
    return response.data.invitations;
  }

  async inviteStaff(input: InviteStaffInput): Promise<InviteStaffResponse> {
    const response = await this.api.post<InviteStaffResponse>('/admin/staff/invite', input);
    return response.data;
  }

  async updateStaffRole(staffId: string, input: UpdateStaffRoleInput): Promise<StaffMember> {
    const response = await this.api.patch<StaffMember>(`/admin/staff/${staffId}/role`, input);
    return response.data;
  }

  async removeStaff(staffId: string): Promise<void> {
    await this.api.delete(`/admin/staff/${staffId}`);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await this.api.delete(`/admin/staff/invitations/${invitationId}`);
  }

  async resendInvitation(invitationId: string): Promise<{ expiresAt: string }> {
    const response = await this.api.post<{ message: string; expiresAt: string }>(
      `/admin/staff/invitations/${invitationId}/resend`
    );
    return { expiresAt: response.data.expiresAt };
  }
}
