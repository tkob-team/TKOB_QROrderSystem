import { Edit, LucideIcon } from 'lucide-react';
import { Card, Badge } from '@/shared/components';
import type { StaffMember, RoleOption } from '../../../model/types';

interface StaffMemberCardProps {
  member: StaffMember;
  roleConfig: RoleOption;
  getInitials: (name: string) => string;
  onEditClick: (member: StaffMember) => void;
}

export function StaffMemberCard({
  member,
  roleConfig,
  getInitials,
  onEditClick,
}: StaffMemberCardProps) {
  const RoleIcon = roleConfig.icon as LucideIcon;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all group shadow-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Avatar and Edit */}
        <div className="flex items-start justify-between">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xl font-bold"
          >
            {getInitials(member.fullName)}
          </div>

          <button
            className="p-2 hover:bg-elevated rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Edit Member"
            onClick={() => onEditClick(member)}
          >
            <Edit className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
          </button>
        </div>

        {/* Name and Email */}
        <div className="flex flex-col gap-1">
          <h4 className="text-text-primary text-lg font-bold">
            {member.fullName}
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
          <Badge variant={member.status === 'ACTIVE' ? 'success' : 'warning'}>
            {member.status === 'ACTIVE' ? 'Active' : member.status === 'PENDING' ? 'Pending' : member.status}
          </Badge>
        </div>

        {/* Join Date */}
        <div className="pt-3 border-t border-default">
          <p className="text-text-tertiary text-[13px]">
            Joined: {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </Card>
  );
}
