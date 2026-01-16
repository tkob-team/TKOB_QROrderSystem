'use client';

import { useStaffController } from '../../hooks';
import type { StaffRole } from '../../model/types';
import { StaffHeaderSection } from '../components/sections/StaffHeaderSection';
import { StaffStatsSection } from '../components/sections/StaffStatsSection';
import { StaffTabBar } from '../components/sections/StaffTabBar';
import { StaffMemberGrid } from '../components/sections/StaffMemberGrid';
import { InviteStaffModal } from '../components/modals/InviteStaffModal';
import { EditStaffModal } from '../components/modals/EditStaffModal';
import { StaffToast } from '../components/modals/StaffToast';

export function StaffPage() {
  const staff = useStaffController();

  const {
    activeTab,
    showInviteModal,
    showEditModal,
    selectedRole,
    inviteEmail,
    selectedMember,
    editForm,
    showToast,
    toastMessage,
  } = staff.state;

  const {
    setActiveTab,
    setShowInviteModal,
    setShowEditModal,
    setSelectedRole,
    setInviteEmail,
    setEditForm,
    handleOpenInviteModal,
    handleOpenEditModal,
    handleSendInvite,
    handleEditMember,
    handleResendInvite,
    handleRevokeInvite,
  } = staff.handlers;

  const staffMembers = staff.queries.staffQuery.data ?? [];
  const roleOptions = staff.queries.rolesQuery.data ?? [];
  const pendingInvitations = staff.queries.invitationsQuery.data ?? [];

  const activeMembers = staffMembers; // All staff from /api/v1/admin/staff are ACTIVE
  const pendingMembers = pendingInvitations; // Pending invitations from /api/v1/admin/staff/invitations
  const displayMembers = activeTab === 'active' ? activeMembers : pendingMembers;

  const stats = {
    total: activeMembers.length + pendingMembers.length,
    active: activeMembers.length,
    pending: pendingMembers.length,
  };

  const getRoleConfig = (role: StaffRole) => {
    return roleOptions.find((r) => r.role === role);
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="px-6 pt-6 pb-5">
      <StaffHeaderSection onInviteClick={handleOpenInviteModal} />

      <StaffStatsSection stats={stats} />

      <StaffTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeMembersCount={activeMembers.length}
        pendingMembersCount={pendingMembers.length}
      />

      <StaffMemberGrid
        members={displayMembers}
        activeTab={activeTab}
        getRoleConfig={getRoleConfig}
        getInitials={getInitials}
        onEditMember={handleOpenEditModal}
        onInviteClick={handleOpenInviteModal}
      />

      <InviteStaffModal
        show={showInviteModal}
        inviteEmail={inviteEmail}
        selectedRole={selectedRole}
        roleOptions={roleOptions}
        onClose={() => setShowInviteModal(false)}
        onEmailChange={setInviteEmail}
        onRoleSelect={setSelectedRole}
        onSendInvite={handleSendInvite}
      />

      <EditStaffModal
        show={showEditModal}
        selectedMember={selectedMember}
        editForm={editForm}
        roleOptions={roleOptions}
        onClose={() => setShowEditModal(false)}
        onFormChange={setEditForm}
        onSaveChanges={handleEditMember}
        onResendInvite={handleResendInvite}
        onRevokeInvite={handleRevokeInvite}
      />

      <StaffToast show={showToast} message={toastMessage} />
    </div>
  );
}
