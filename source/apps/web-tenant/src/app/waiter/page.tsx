'use client';

import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { ClipboardList } from 'lucide-react';

export default function WaiterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg text-center p-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Service Board</h1>
        <p className="text-gray-600 mb-8">
          Full waiter service board implementation coming in Phase 3. This layout is ready for table management and order service features.
        </p>
        <div className="flex flex-col gap-3">
          <Button disabled>Service Board (Coming Soon)</Button>
          <p className="text-sm text-gray-500">Phase 3: KDS & Waiter Screens</p>
        </div>
      </Card>
    </div>
  );
}
