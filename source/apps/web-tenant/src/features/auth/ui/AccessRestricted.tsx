'use client';

import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

interface AccessRestrictedProps {
  onNavigate: (path: string) => void;
}

export function AccessRestricted({ onNavigate }: AccessRestrictedProps) {
  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex flex-col items-center gap-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-600">
            You don&apos;t have permission to view this page. This area is restricted to administrators and managers only.
          </p>
          <p className="text-sm text-gray-600">
            If you believe this is a mistake, please contact your restaurant administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Button onClick={() => onNavigate('/admin/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => window.location.href = 'mailto:support@tkqr.com'}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </Card>
  );
}
