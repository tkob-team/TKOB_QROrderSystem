/**
 * Staff Hooks
 * React Query wrappers for staff data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAdapter } from '../../data/factory';
import type { StaffMember } from '../../model/types';

export function useStaffMembers() {
  return useQuery({
    queryKey: ['staff', 'members'],
    queryFn: () => staffAdapter.getStaffMembers(),
  });
}

export function useRoleOptions() {
  return useQuery({
    queryKey: ['staff', 'roles'],
    queryFn: () => staffAdapter.getRoleOptions(),
  });
}

export function useAddStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (staff: Omit<StaffMember, 'id'>) => staffAdapter.addStaffMember(staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'members'] });
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<StaffMember> }) =>
      staffAdapter.updateStaffMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'members'] });
    },
  });
}

export function useDeleteStaffMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => staffAdapter.deleteStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'members'] });
    },
  });
}
