import { Plus } from 'lucide-react';

interface StaffHeaderSectionProps {
  onInviteClick: () => void;
}

export function StaffHeaderSection({ onInviteClick }: StaffHeaderSectionProps) {
  return (
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
        onClick={onInviteClick}
        className="flex items-center gap-2 px-5 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] hover:-translate-y-0.5 active:translate-y-0 text-white transition-all text-[15px] font-semibold rounded-lg shadow-sm hover:shadow-md"
      >
        <Plus className="w-5 h-5" />
        Invite Member
      </button>
    </div>
  );
}
