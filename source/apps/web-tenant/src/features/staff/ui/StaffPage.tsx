'use client';

import { useState } from 'react';
import {
  Plus,
  X,
  Edit,
  Users,
  UserCheck,
  Clock,
  Mail,
  Info,
} from 'lucide-react';
import { Card, Badge } from '@/shared/components';
import { useStaffMembers, useRoleOptions } from '../hooks';
import type { StaffRole, StaffStatus, StaffMember, EditForm } from '../model/types';

export function StaffPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Use hooks for data fetching
  const { data: staffMembers = [] } = useStaffMembers();
  const { data: roleOptions = [] } = useRoleOptions();
  const [toastMessage, setToastMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    role: 'waiter' as StaffRole,
    status: 'active' as 'active' | 'disabled',
  });

  const activeMembers = staffMembers.filter((m) => m.status === 'active');
  const pendingMembers = staffMembers.filter((m) => m.status === 'pending');
  const displayMembers = activeTab === 'active' ? activeMembers : pendingMembers;

  const stats = {
    total: staffMembers.length,
    active: activeMembers.length,
    pending: pendingMembers.length,
  };

  const getRoleConfig = (role: StaffRole) => {
    return roleOptions.find((r) => r.role === role);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      setStaffMembers([...staffMembers, newMember]);
      showSuccessToast(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
    }
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

  const handleEditMember = () => {
    if (selectedMember) {
      const updatedMembers = staffMembers.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              name: editForm.name,
              email: editForm.email,
              role: editForm.role,
              status: editForm.status === 'active' ? ('active' as const) : ('pending' as const),
            }
          : m
      );
      setStaffMembers(updatedMembers);
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
      setStaffMembers(staffMembers.filter((m) => m.id !== selectedMember.id));
      showSuccessToast(`Invite revoked for ${selectedMember.email}`);
      setShowEditModal(false);
    }
  };

  return (
    <div className="px-6 pt-6 pb-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[28px] font-bold">
            Staff Management
          </h2>
          <p className="text-text-secondary text-[15px]">
            Manage your team members and access permissions
          </p>
        </div>
        <button
          onClick={handleOpenInviteModal}
          className="flex items-center gap-2 px-5 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] hover:-translate-y-0.5 active:translate-y-0 text-white transition-all text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-text-tertiary text-sm font-medium mb-1">
                Total Members
              </p>
              <p className="text-text-primary text-[28px] font-bold">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-text-tertiary text-sm font-medium mb-1">
                Active
              </p>
              <p className="text-text-primary text-[28px] font-bold">
                {stats.active}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-text-tertiary text-sm font-medium mb-1">
                Pending Invites
              </p>
              <p className="text-text-primary text-[28px] font-bold">
                {stats.pending}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b border-default mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 transition-all relative text-[15px] font-semibold ${
            activeTab === 'active' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Active Members ({activeMembers.length})
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 transition-all relative text-[15px] font-semibold ${
            activeTab === 'pending' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Pending Invites ({pendingMembers.length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
        </button>
      </div>

      {/* Staff Grid */}
      {displayMembers.length === 0 ? (
        <Card className="p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mb-4">
              {activeTab === 'active' ? (
                <UserCheck className="w-10 h-10 text-text-tertiary" />
              ) : (
                <Clock className="w-10 h-10 text-text-tertiary" />
              )}
            </div>
            <h4 className="text-text-primary text-lg font-semibold mb-2">
              {activeTab === 'active' ? 'No active members' : 'No pending invites'}
            </h4>
            <p className="text-text-secondary text-[15px] mb-6">
              {activeTab === 'active'
                ? 'Invite your first team member to get started'
                : 'No pending invitations at the moment'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={handleOpenInviteModal}
                className="px-6 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-all flex items-center gap-2 text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                Invite Member
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayMembers.map((member) => {
            const roleConfig = getRoleConfig(member.role);
            const RoleIcon = roleConfig.icon;

            return (
              <Card
                key={member.id}
                className="p-6 hover:shadow-lg transition-all group shadow-sm"
              >
                <div className="flex flex-col gap-4">
                  {/* Avatar and Edit */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xl font-bold"
                    >
                      {getInitials(member.name)}
                    </div>

                    <button
                      className="p-2 hover:bg-elevated rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit Member"
                      onClick={() => handleOpenEditModal(member)}
                    >
                      <Edit className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
                    </button>
                  </div>

                  {/* Name and Email */}
                  <div className="flex flex-col gap-1">
                    <h4 className="text-text-primary text-lg font-bold">
                      {member.name}
                    </h4>
                    <p className="text-text-secondary text-sm">
                      {member.email}
                    </p>
                  </div>

                  {/* Role and Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${roleConfig.bg}`}
                    >
                      <RoleIcon className={`w-4 h-4 ${roleConfig.color}`} />
                      <span className={`${roleConfig.color} text-[13px] font-semibold`}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Join Date */}
                  <div className="pt-3 border-t border-default">
                    <p className="text-text-tertiary text-[13px]">
                      {member.status === 'active' ? 'Joined' : 'Invited'}: {member.joinedDate}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-md"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-secondary w-full max-w-2xl mx-4 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-default">
              <div>
                <h3 className="text-text-primary text-[22px] font-bold">
                  Invite Team Member
                </h3>
                <p className="text-text-secondary mt-1 text-sm">
                  Send an invitation to join your restaurant team
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-elevated rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-semibold">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full pl-10 pr-4 py-3 h-12 border border-default bg-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
                    autoFocus
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-text-primary text-sm font-semibold">
                  Select Role *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = selectedRole === option.role;

                    return (
                      <button
                        key={option.role}
                        onClick={() => setSelectedRole(option.role)}
                        className={`flex items-start gap-4 p-4 border-2 transition-all text-left rounded-lg ${
                          isSelected
                            ? `border-${option.color}-500 bg-${option.color}-50`
                            : 'border-default hover:border-elevated'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? `bg-${option.color}-100` : 'bg-elevated'
                          }`}
                        >
                          <OptionIcon
                            className={`w-6 h-6 ${
                              isSelected ? `text-${option.color}-600` : 'text-text-tertiary'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-text-primary text-base font-semibold">
                              {option.label}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-text-secondary text-[13px] leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info Tip */}
              <div className="flex gap-3 p-4 bg-info-bg border border-info-border rounded-lg">
                <Info className="w-5 h-5 text-info-text flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-info-text text-[13px] leading-relaxed">
                    <strong>Important:</strong> The invited member will receive an email with instructions to
                    set up their account. They won&apos;t have access until they accept the invitation and create a
                    password.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-default">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 h-12 border-2 border-default text-text-secondary hover:bg-elevated transition-colors text-[15px] font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail || !selectedRole}
                className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors text-[15px] font-semibold rounded-lg"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-white/40 backdrop-blur-md"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-secondary w-full max-w-2xl mx-4 flex flex-col rounded-2xl shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-default">
              <div>
                <h3 className="text-text-primary text-[22px] font-bold">
                  Edit Team Member
                </h3>
                <p className="text-text-secondary mt-1 text-sm">
                  Update details for this team member
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-elevated rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
              {/* Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-semibold">
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 h-12 border border-default bg-secondary text-text-primary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={selectedMember.status === 'active'}
                  className="w-full px-4 py-3 h-12 border border-default bg-secondary text-text-primary disabled:bg-elevated disabled:cursor-not-allowed focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-[15px] rounded-lg"
                />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-text-primary text-sm font-semibold">
                  Role *
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as StaffRole })}
                  className="px-4 py-3 h-12 border border-default rounded-lg bg-secondary text-text-primary cursor-pointer focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-[15px]"
                >
                  {roleOptions.map((option) => (
                    <option key={option.role} value={option.role}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pending Actions */}
              {selectedMember.status === 'pending' && (
                <div className="flex flex-col gap-3 pt-4 border-t border-default">
                  <button
                    onClick={handleResendInvite}
                    className="w-full px-4 py-3 border-2 border-accent-300 text-accent-600 hover:bg-accent-50 transition-colors text-[15px] font-semibold rounded-lg"
                  >
                    Resend Invitation
                  </button>
                  <button
                    onClick={handleRevokeInvite}
                    className="w-full px-4 py-3 border-2 border-red-300 text-red-700 hover:bg-red-50 transition-colors text-[15px] font-semibold rounded-lg"
                  >
                    Revoke Invitation
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-default">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 h-12 border-2 border-default text-text-secondary hover:bg-elevated transition-colors text-[15px] font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMember}
                className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors text-[15px] font-semibold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-[rgb(var(--success))] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-[rgb(var(--success))] text-xs">✓</span>
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
