/**
 * Staff Controller Hook
 * Orchestrates staff feature state, queries, and actions
 */

import { useState } from 'react';
import { useStaffMembers, useRoleOptions } from './queries/useStaff';
import type { StaffRole, StaffMember, EditForm } from '../model/types';

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
    role: 'waiter' as StaffRole,
    status: 'active' as 'active' | 'disabled',
  });
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Data queries
  const staffQuery = useStaffMembers();
  const rolesQuery = useRoleOptions();
  
  const isLoading = staffQuery.isLoading || rolesQuery.isLoading;

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
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status === 'active' ? 'active' : 'disabled',
    });
    setShowEditModal(true);
  };

  const handleSendInvite = () => {
    if (inviteEmail && selectedRole) {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: selectedRole,
        status: 'pending',
        joinedDate: `Invited ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      };
      // TODO: Use mutation to add member to backend
      console.log('Adding new member:', newMember);
      showSuccessToast(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
    }
  };

  const handleEditMember = () => {
    if (selectedMember) {
      // TODO: Use mutation to update member in backend
      console.log('Updating member:', selectedMember.id, editForm);
      showSuccessToast('Member updated successfully');
      setShowEditModal(false);
    }
  };

  const handleResendInvite = () => {
    if (selectedMember) {
      showSuccessToast(`Invite resent to ${selectedMember.email}`);
      setShowEditModal(false);
    }
  };

  const handleRevokeInvite = () => {
    if (selectedMember && confirm(`Revoke invitation for ${selectedMember.email}?`)) {
      // TODO: Use mutation to revoke member in backend
      console.log('Revoking member:', selectedMember.id);
      showSuccessToast(`Invite revoked for ${selectedMember.email}`);
      setShowEditModal(false);
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
    },
    isLoading,
  };
}
