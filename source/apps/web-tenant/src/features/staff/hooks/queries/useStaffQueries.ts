/**
 * useStaffQueries - React Query hooks for Staff data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAdapter } from '../../data';
import type { InviteStaffInput, UpdateStaffRoleInput } from '../../model/types';
import { toast } from 'sonner';

// Query Keys
export const staffKeys = {
  all: ['staff'] as const,
  members: () => [...staffKeys.all, 'members'] as const,
  invitations: () => [...staffKeys.all, 'invitations'] as const,
  roles: () => [...staffKeys.all, 'roles'] as const,
};

/**
 * Fetch all staff members
 */
export function useStaffMembers() {
  return useQuery({
    queryKey: staffKeys.members(),
    queryFn: () => staffAdapter.getStaffMembers(),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Fetch pending invitations
 */
export function usePendingInvitations() {
  return useQuery({
    queryKey: staffKeys.invitations(),
    queryFn: () => staffAdapter.getPendingInvitations(),
    staleTime: 30_000,
  });
}

/**
 * Fetch role options
 */
export function useRoleOptions() {
  return useQuery({
    queryKey: staffKeys.roles(),
    queryFn: () => staffAdapter.getRoleOptions(),
    staleTime: Infinity, // Never stale (static data)
  });
}

/**
 * Invite staff member mutation
 */
export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteStaffInput) => staffAdapter.inviteStaff(input),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: staffKeys.invitations() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });
}

/**
 * Update staff role mutation
 */
export function useUpdateStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, input }: { staffId: string; input: UpdateStaffRoleInput }) =>
      staffAdapter.updateStaffRole(staffId, input),
    onSuccess: () => {
      toast.success('Staff role updated');
      queryClient.invalidateQueries({ queryKey: staffKeys.members() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

/**
 * Remove staff member mutation
 */
export function useRemoveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffAdapter.removeStaff(staffId),
    onSuccess: () => {
      toast.success('Staff member removed');
      queryClient.invalidateQueries({ queryKey: staffKeys.members() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove staff member');
    },
  });
}

/**
 * Cancel invitation mutation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => staffAdapter.cancelInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: staffKeys.invitations() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel invitation');
    },
  });
}

/**
 * Resend invitation mutation
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => staffAdapter.resendInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation resent');
      queryClient.invalidateQueries({ queryKey: staffKeys.invitations() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });
}
