/**
 * Staff Mock Data
 * Raw mock constants (no methods)
 */

import { Shield, ChefHat, User } from 'lucide-react';
import type { StaffMember, RoleOption, StaffRole } from '../../model/types';

export const MOCK_ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'OWNER' as StaffRole,
    icon: Shield,
    label: 'Owner',
    description: 'Full access to all features, settings, and reports',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    role: 'STAFF' as StaffRole,
    icon: User,
    label: 'Staff',
    description: 'Access to orders, tables, and service management',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    role: 'KITCHEN' as StaffRole,
    icon: ChefHat,
    label: 'Kitchen',
    description: 'Access to KDS and order preparation',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@tkobrestaurant.com',
    role: 'OWNER',
    status: 'ACTIVE',
    createdAt: '2024-10-15T10:00:00Z',
  },
  {
    id: '2',
    fullName: 'Sarah Wilson',
    email: 'sarah@tkobrestaurant.com',
    role: 'KITCHEN',
    status: 'ACTIVE',
    createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '3',
    fullName: 'David Chen',
    email: 'david@tkobrestaurant.com',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '4',
    fullName: 'Emily Park',
    email: 'emily@tkobrestaurant.com',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '5',
    fullName: 'Michael Brown',
    email: 'michael@tkobrestaurant.com',
    role: 'KITCHEN',
    status: 'ACTIVE',
    createdAt: '2024-12-10T10:00:00Z',
  },
];
