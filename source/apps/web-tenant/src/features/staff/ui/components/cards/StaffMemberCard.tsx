import { Edit, UserX, UserCheck, LucideIcon } from 'lucide-react';
import { Card, Badge } from '@/shared/components';
import type { StaffMember, RoleOption } from '../../../model/types';

interface StaffMemberCardProps {
  member: StaffMember;
  roleConfig: RoleOption;
  getInitials: (name: string) => string;
  onEditClick: (member: StaffMember) => void;
  onToggleStatus?: (member: StaffMember) => void; // BUG-18: Toggle activate/deactivate
}

export function StaffMemberCard({
  member,
  roleConfig,
  getInitials,
  onEditClick,
  onToggleStatus,
}: StaffMemberCardProps) {
  const RoleIcon = roleConfig.icon as LucideIcon;
  const isActive = member.status === 'ACTIVE';

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all group shadow-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Avatar and Actions */}
        <div className="flex items-start justify-between">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
              isActive 
                ? 'bg-gradient-to-br from-accent-400 to-accent-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}
          >
            {getInitials(member.fullName)}
          </div>

          <div className="flex gap-1">
            {/* BUG-18: Deactivate/Reactivate button */}
            {onToggleStatus && (
              <button
                className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                  isActive 
                    ? 'hover:bg-red-50 text-red-500 hover:text-red-600' 
                    : 'hover:bg-green-50 text-green-500 hover:text-green-600'
                }`}
                title={isActive ? 'Deactivate Staff' : 'Reactivate Staff'}
                onClick={() => onToggleStatus(member)}
              >
                {isActive ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              className="p-2 hover:bg-elevated rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Edit Member"
              onClick={() => onEditClick(member)}
            >
              <Edit className="w-4 h-4 text-text-tertiary hover:text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Name and Email */}
        <div className="flex flex-col gap-1">
          <h4 className={`text-lg font-bold ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
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
          <Badge variant={isActive ? 'success' : member.status === 'PENDING' ? 'warning' : 'destructive'}>
            {isActive ? 'Active' : member.status === 'PENDING' ? 'Pending' : 'Inactive'}
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

