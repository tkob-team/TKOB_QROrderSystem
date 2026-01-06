'use client';

import { Card, Button } from '@/shared/components';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccessRestrictedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/auth/login')} className="w-full">
            Back to Login
          </Button>
          <Button variant="secondary" onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
