/**
 * Staff Mock Adapter
 * Mock implementation for staff data
 */

import { Shield, ChefHat, Utensils } from 'lucide-react';
import type { IStaffAdapter } from './staff-adapter.interface';
import type { StaffMember, RoleOption, StaffRole } from '../model/types';

export class MockStaffAdapter implements IStaffAdapter {
  private roleOptions: RoleOption[] = [
    {
      role: 'admin' as StaffRole,
      icon: Shield,
      label: 'Admin',
      description: 'Full access to all features, settings, and reports',
      color: 'purple',
    },
    {
      role: 'kitchen' as StaffRole,
      icon: ChefHat,
      label: 'Kitchen Staff',
      description: 'Access to KDS, order preparation and kitchen workflows',
      color: 'orange',
    },
    {
      role: 'waiter' as StaffRole,
      icon: Utensils,
      label: 'Waiter/Server',
      description: 'Access to service board, orders, and table management',
      color: 'blue',
    },
  ];

  private mockStaffMembers: StaffMember[] = [
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

  async getStaffMembers(): Promise<StaffMember[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockStaffMembers;
  }

  async getRoleOptions(): Promise<RoleOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.roleOptions;
  }

  async addStaffMember(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newStaff = {
      ...staff,
      id: String(this.mockStaffMembers.length + 1),
    };
    this.mockStaffMembers.push(newStaff);
    return newStaff;
  }

  async updateStaffMember(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    
    this.mockStaffMembers[index] = {
      ...this.mockStaffMembers[index],
      ...updates,
    };
    return this.mockStaffMembers[index];
  }

  async deleteStaffMember(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.mockStaffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Staff member not found');
    this.mockStaffMembers.splice(index, 1);
  }
}
