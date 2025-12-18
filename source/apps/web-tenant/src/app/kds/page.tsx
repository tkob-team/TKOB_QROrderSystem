'use client';

import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Utensils } from 'lucide-react';

export default function KDSPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg text-center p-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Utensils className="w-10 h-10 text-slate-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Kitchen Display System</h1>
        <p className="text-gray-600 mb-8">
          Full KDS board implementation coming in Phase 3. This layout is ready for the complete kitchen display interface.
        </p>
        <div className="flex flex-col gap-3">
          <Button disabled>KDS Board (Coming Soon)</Button>
          <p className="text-sm text-gray-500">Phase 3: KDS & Waiter Screens</p>
        </div>
      </Card>
    </div>
  );
}
