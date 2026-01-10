import { Plus, UserCheck, Clock } from 'lucide-react';
import { Card } from '@/shared/components';
import { StaffMemberCard } from '../cards/StaffMemberCard';
import type { StaffMember, RoleOption, StaffRole } from '../../../model/types';

interface StaffMemberGridProps {
  members: StaffMember[];
  activeTab: 'active' | 'pending';
  getRoleConfig: (role: StaffRole) => RoleOption | undefined;
  getInitials: (name: string) => string;
  onEditMember: (member: StaffMember) => void;
  onInviteClick: () => void;
}

export function StaffMemberGrid({
  members,
  activeTab,
  getRoleConfig,
  getInitials,
  onEditMember,
  onInviteClick,
}: StaffMemberGridProps) {
  if (members.length === 0) {
    return (
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
              onClick={onInviteClick}
              className="px-6 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-all flex items-center gap-2 text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Invite Member
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {members.map((member) => {
        const roleConfig = getRoleConfig(member.role);
        if (!roleConfig) return null;

        return (
          <StaffMemberCard
            key={member.id}
            member={member}
            roleConfig={roleConfig}
            getInitials={getInitials}
            onEditClick={onEditMember}
          />
        );
      })}
    </div>
  );
}
