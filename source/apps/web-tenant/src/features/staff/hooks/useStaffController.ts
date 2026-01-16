'use client';

/**
 * Staff Controller Hook
 * Orchestrates staff feature state, queries, and actions
 */

import { useState } from 'react';
import { logger } from '@/shared/utils/logger';
import { useStaffMembers, useRoleOptions, usePendingInvitations } from './queries/useStaff';
import { 
  useStaffControllerInviteStaff,
  useStaffControllerUpdateStaffRole,
  useStaffControllerRemoveStaff,
  useStaffControllerCancelInvitation,
  useStaffControllerResendInvitation,
} from '@/services/generated/staff-management/staff-management';
import type { StaffRole, StaffMember, EditForm, StaffStatus } from '../model/types';

export function useStaffController() {
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  
  // Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Invite form state
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Edit form state
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    role: 'STAFF' as StaffRole,
    status: 'ACTIVE' as StaffStatus,
  });
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Data queries
  const staffQuery = useStaffMembers();
  const rolesQuery = useRoleOptions();
  const invitationsQuery = usePendingInvitations();
  
  // Mutations
  const inviteStaffMutation = useStaffControllerInviteStaff();
  const updateStaffRoleMutation = useStaffControllerUpdateStaffRole();
  const removeStaffMutation = useStaffControllerRemoveStaff();
  const cancelInvitationMutation = useStaffControllerCancelInvitation();
  const resendInvitationMutation = useStaffControllerResendInvitation();
  
  const isLoading = staffQuery.isLoading || rolesQuery.isLoading || invitationsQuery.isLoading;

  // Handlers
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOpenInviteModal = () => {
    setInviteEmail('');
    setSelectedRole(null);
    setShowInviteModal(true);
  };

  const handleOpenEditModal = (member: StaffMember) => {
    setSelectedMember(member);
    setEditForm({
      name: member.fullName,
      email: member.email,
      role: member.role,
      status: member.status,
    });
    setShowEditModal(true);
  };

  const handleSendInvite = async () => {
    if (inviteEmail && selectedRole) {
      logger.info('[staff] SEND_INVITE_ATTEMPT', { role: selectedRole });
      try {
        await inviteStaffMutation.mutateAsync({
          data: {
            email: inviteEmail,
            role: selectedRole as any, // Role mapping handled by backend
          },
        });
        logger.debug('[staff] INVITE_SENT', { email: inviteEmail });
        logger.info('[staff] SEND_INVITE_SUCCESS', { role: selectedRole });
        showSuccessToast(`Invitation sent to ${inviteEmail}`);
        setShowInviteModal(false);
        staffQuery.refetch();
        invitationsQuery.refetch();
      } catch (error) {
        logger.error('[staff] SEND_INVITE_ERROR', {
          role: selectedRole,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        showSuccessToast('Failed to send invitation');
      }
    }
  };

  const handleEditMember = async () => {
    if (selectedMember) {
      logger.info('[staff] UPDATE_MEMBER_ATTEMPT', { memberId: selectedMember.id, role: editForm.role });
      try {
        await updateStaffRoleMutation.mutateAsync({
          staffId: selectedMember.id,
          data: {
            role: editForm.role as any, // Role mapping handled by backend
          },
        });
        logger.debug('[staff] MEMBER_UPDATED', { memberId: selectedMember.id });
        logger.info('[staff] UPDATE_MEMBER_SUCCESS', { memberId: selectedMember.id });
        showSuccessToast('Member updated successfully');
        setShowEditModal(false);
        staffQuery.refetch();
      } catch (error) {
        logger.error('[staff] UPDATE_MEMBER_ERROR', {
          memberId: selectedMember.id,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        showSuccessToast('Failed to update member');
      }
    }
  };

  const handleResendInvite = async () => {
    if (selectedMember) {
      logger.info('[staff] RESEND_INVITE_ATTEMPT', { memberId: selectedMember.id });
      try {
        await resendInvitationMutation.mutateAsync({
          invitationId: selectedMember.id,
        });
        logger.info('[staff] RESEND_INVITE_SUCCESS', { memberId: selectedMember.id });
        showSuccessToast(`Invite resent to ${selectedMember.email}`);
        setShowEditModal(false);
      } catch (error) {
        logger.error('[staff] RESEND_INVITE_ERROR', {
          memberId: selectedMember.id,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        showSuccessToast('Failed to resend invitation');
      }
    }
  };

  const handleRevokeInvite = async () => {
    if (!selectedMember) return;
    
    const isPending = selectedMember.status === 'PENDING';
    const confirmMessage = isPending
      ? `Revoke invitation for ${selectedMember.email}?`
      : `Remove ${selectedMember.fullName} from staff?`;
    
    if (!confirm(confirmMessage)) return;
    
    logger.info('[staff] REVOKE_ATTEMPT', { memberId: selectedMember.id, status: selectedMember.status });
    
    try {
      if (isPending) {
        // Cancel pending invitation
        await cancelInvitationMutation.mutateAsync({
          invitationId: selectedMember.id,
        });
        logger.info('[staff] INVITATION_CANCELLED', { memberId: selectedMember.id });
        showSuccessToast(`Invitation revoked for ${selectedMember.email}`);
      } else {
        // Remove active staff member
        await removeStaffMutation.mutateAsync({
          staffId: selectedMember.id,
        });
        logger.info('[staff] STAFF_REMOVED', { memberId: selectedMember.id });
        showSuccessToast(`${selectedMember.fullName} removed from staff`);
      }
      setShowEditModal(false);
      staffQuery.refetch();
      invitationsQuery.refetch();
    } catch (error) {
      logger.error('[staff] REVOKE_ERROR', {
        memberId: selectedMember.id,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      showSuccessToast(isPending ? 'Failed to revoke invitation' : 'Failed to remove staff member');
    }
  };

  return {
    state: {
      activeTab,
      showInviteModal,
      showEditModal,
      selectedRole,
      inviteEmail,
      selectedMember,
      editForm,
      showToast,
      toastMessage,
    },
    handlers: {
      setActiveTab,
      setShowInviteModal,
      setShowEditModal,
      setSelectedRole,
      setInviteEmail,
      setSelectedMember,
      setEditForm,
      showSuccessToast,
      handleOpenInviteModal,
      handleOpenEditModal,
      handleSendInvite,
      handleEditMember,
      handleResendInvite,
      handleRevokeInvite,
    },
    queries: {
      staffQuery,
      rolesQuery,
      invitationsQuery,
    },
    isLoading,
  };
}
