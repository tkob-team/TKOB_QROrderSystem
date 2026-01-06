// Staff Management Types

export type StaffRole = 'admin' | 'kitchen' | 'waiter';
export type StaffStatus = 'active' | 'pending';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  joinedDate: string;
}

export interface RoleOption {
  role: StaffRole;
  icon: any; // Lucide icon component
  label: string;
  description: string;
  color: string;
}

export interface EditForm {
  name: string;
  email: string;
  role: StaffRole;
  status: 'active' | 'disabled';
}
