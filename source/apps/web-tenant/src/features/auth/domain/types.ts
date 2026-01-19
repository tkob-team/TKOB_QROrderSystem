// Auth domain types
// Keeps a minimal, shared shape for authenticated users and roles

export type UserRole = 'admin' | 'kds' | 'waiter';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenant?: Tenant;
}
