/**
 * Staff Mock Data
 * Raw mock constants (no methods)
 */

import { Shield, ChefHat, Utensils } from 'lucide-react';
import type { StaffMember, RoleOption, StaffRole } from '../../model/types';

export const MOCK_ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'admin' as StaffRole,
    icon: Shield,
    label: 'Admin',
    description: 'Full access to all features, settings, and reports',
    color: 'purple',
    bg: 'bg-purple-50',
  },
  {
    role: 'kitchen' as StaffRole,
    icon: ChefHat,
    label: 'Kitchen Staff',
    description: 'Access to KDS, order preparation and kitchen workflows',
    color: 'orange',
    bg: 'bg-orange-50',
  },
  {
    role: 'waiter' as StaffRole,
    icon: Utensils,
    label: 'Waiter/Server',
    description: 'Access to service board, orders, and table management',
    color: 'blue',
    bg: 'bg-blue-50',
  },
];

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@tkobrestaurant.com',
    role: 'admin',
    status: 'active',
    joinedDate: 'Oct 2024',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@tkobrestaurant.com',
    role: 'kitchen',
    status: 'active',
    joinedDate: 'Nov 2024',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@tkobrestaurant.com',
    role: 'waiter',
    status: 'active',
    joinedDate: 'Nov 2024',
  },
  {
    id: '4',
    name: 'Emily Park',
    email: 'emily@tkobrestaurant.com',
    role: 'waiter',
    status: 'active',
    joinedDate: 'Dec 2024',
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael@tkobrestaurant.com',
    role: 'kitchen',
    status: 'active',
    joinedDate: 'Dec 2024',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa@tkobrestaurant.com',
    role: 'waiter',
    status: 'active',
    joinedDate: 'Dec 2024',
  },
  {
    id: '7',
    name: 'Tom Martinez',
    email: 'tom@tkobrestaurant.com',
    role: 'waiter',
    status: 'pending',
    joinedDate: 'Jan 2025',
  },
  {
    id: '8',
    name: 'Jessica Lee',
    email: 'jessica@tkobrestaurant.com',
    role: 'kitchen',
    status: 'pending',
    joinedDate: 'Jan 2025',
  },
];
