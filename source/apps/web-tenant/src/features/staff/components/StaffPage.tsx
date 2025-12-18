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
  Shield,
  ChefHat,
  Utensils,
  Info,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';

type StaffRole = 'admin' | 'kitchen' | 'waiter';
type StaffStatus = 'active' | 'pending';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  joinedDate: string;
}

const roleOptions = [
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

export function StaffPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'waiter' as StaffRole,
    status: 'active' as 'active' | 'disabled',
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
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
      name: 'James Taylor',
      email: 'james@tkobrestaurant.com',
      role: 'waiter',
      status: 'pending',
      joinedDate: 'Invited Dec 8',
    },
    {
      id: '8',
      name: 'Anna Martinez',
      email: 'anna@tkobrestaurant.com',
      role: 'kitchen',
      status: 'pending',
      joinedDate: 'Invited Dec 7',
    },
  ]);

  const activeMembers = staffMembers.filter((m) => m.status === 'active');
  const pendingMembers = staffMembers.filter((m) => m.status === 'pending');
  const displayMembers = activeTab === 'active' ? activeMembers : pendingMembers;

  const stats = {
    total: staffMembers.length,
    active: activeMembers.length,
    pending: pendingMembers.length,
  };

  const getRoleConfig = (role: StaffRole) => {
    const option = roleOptions.find((o) => o.role === role)!;
    return {
      label: option.label,
      icon: option.icon,
      color: `text-${option.color}-600`,
      bg: `bg-${option.color}-50`,
    };
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
          <h2 className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
            Staff Management
          </h2>
          <p className="text-gray-600" style={{ fontSize: '15px' }}>
            Manage your team members and access permissions
          </p>
        </div>
        <button
          onClick={handleOpenInviteModal}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '12px',
            height: '48px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Plus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                Total Members
              </p>
              <p className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                Active
              </p>
              <p className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                {stats.active}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                Pending Invites
              </p>
              <p className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                {stats.pending}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 transition-all relative ${
            activeTab === 'active' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          Active Members ({activeMembers.length})
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 transition-all relative ${
            activeTab === 'pending' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          Pending Invites ({pendingMembers.length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
      </div>

      {/* Staff Grid */}
      {displayMembers.length === 0 ? (
        <Card className="p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'active' ? (
                <UserCheck className="w-10 h-10 text-gray-400" />
              ) : (
                <Clock className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h4 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
              {activeTab === 'active' ? 'No active members' : 'No pending invites'}
            </h4>
            <p className="text-gray-600 mb-6" style={{ fontSize: '15px' }}>
              {activeTab === 'active'
                ? 'Invite your first team member to get started'
                : 'No pending invitations at the moment'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={handleOpenInviteModal}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
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
                className="p-6 hover:shadow-lg transition-all group"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <div className="flex flex-col gap-4">
                  {/* Avatar and Edit */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white"
                      style={{ fontSize: '20px', fontWeight: 700 }}
                    >
                      {getInitials(member.name)}
                    </div>

                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit Member"
                      onClick={() => handleOpenEditModal(member)}
                    >
                      <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>

                  {/* Name and Email */}
                  <div className="flex flex-col gap-1">
                    <h4 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
                      {member.name}
                    </h4>
                    <p className="text-gray-600" style={{ fontSize: '14px' }}>
                      {member.email}
                    </p>
                  </div>

                  {/* Role and Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${roleConfig.bg}`}
                    >
                      <RoleIcon className={`w-4 h-4 ${roleConfig.color}`} />
                      <span className={roleConfig.color} style={{ fontSize: '13px', fontWeight: 600 }}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Join Date */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>
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
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl mx-4"
            style={{
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
                  Invite Team Member
                </h3>
                <p className="text-gray-600 mt-1" style={{ fontSize: '14px' }}>
                  Send an invitation to join your restaurant team
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                    style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
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
                        className={`flex items-start gap-4 p-4 border-2 transition-all text-left ${
                          isSelected
                            ? `border-${option.color}-500 bg-${option.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ borderRadius: '12px' }}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? `bg-${option.color}-100` : 'bg-gray-100'
                          }`}
                        >
                          <OptionIcon
                            className={`w-6 h-6 ${
                              isSelected ? `text-${option.color}-600` : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                              {option.label}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
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
                          <p className="text-gray-600" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info Tip */}
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <strong>Important:</strong> The invited member will receive an email with instructions to
                    set up their account. They won&apos;t have access until they accept the invitation and create a
                    password.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail || !selectedRole}
                className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
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
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl mx-4 flex flex-col"
            style={{
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
                  Edit Team Member
                </h3>
                <p className="text-gray-600 mt-1" style={{ fontSize: '14px' }}>
                  Update details for this team member
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
              {/* Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={selectedMember.status === 'active'}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
                />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Role *
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as StaffRole })}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
                  style={{ fontSize: '15px', height: '48px' }}
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
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleResendInvite}
                    className="w-full px-4 py-3 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                    style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                  >
                    Resend Invitation
                  </button>
                  <button
                    onClick={handleRevokeInvite}
                    className="w-full px-4 py-3 border-2 border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                    style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                  >
                    Revoke Invitation
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditMember}
                className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-500 text-xs">✓</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
