// Staff Management Types

export type StaffRole = 'OWNER' | 'STAFF' | 'KITCHEN';
export type StaffStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'LOCKED';

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: 'STAFF' | 'KITCHEN';
  expiresAt: string;
  createdAt: string;
}

export interface RoleOption {
  role: StaffRole;
  icon: unknown; // Lucide icon component
  label: string;
  description: string;
  color: string;
  bg: string;
}

export interface InviteStaffInput {
  email: string;
  role: 'STAFF' | 'KITCHEN';
}

export interface UpdateStaffRoleInput {
  role: 'STAFF' | 'KITCHEN';
}

// Legacy type alias for backward compatibility
export type EditForm = {
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
}
