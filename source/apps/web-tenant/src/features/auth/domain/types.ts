// Auth domain types
// Keeps a minimal, shared shape for authenticated users and roles

export type UserRole = 'admin' | 'kds' | 'waiter';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}
