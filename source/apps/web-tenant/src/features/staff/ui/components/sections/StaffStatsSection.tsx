import { Users, UserCheck, Clock } from 'lucide-react';
import { Card } from '@/shared/components';

interface StaffStatsSectionProps {
  stats: {
    total: number;
    active: number;
    pending: number;
  };
}

export function StaffStatsSection({ stats }: StaffStatsSectionProps) {
  return (
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
  );
}
