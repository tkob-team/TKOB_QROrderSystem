/**
 * Staff Hooks
 * React Query wrappers for staff data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAdapter } from '../../data/factory';
import type { InviteStaffInput, UpdateStaffRoleInput } from '../../model/types';

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

export function usePendingInvitations() {
  return useQuery({
    queryKey: ['staff', 'invitations'],
    queryFn: () => staffAdapter.getPendingInvitations(),
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: InviteStaffInput) => staffAdapter.inviteStaff(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'invitations'] });
    },
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffRoleInput }) =>
      staffAdapter.updateStaffRole(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'members'] });
    },
  });
}

export function useRemoveStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => staffAdapter.removeStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'members'] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invitationId: string) => staffAdapter.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'invitations'] });
    },
  });
}
