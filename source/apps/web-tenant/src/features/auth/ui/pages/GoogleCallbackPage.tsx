'use client';

import { Suspense } from 'react';
import { GoogleCallbackContent } from './GoogleCallbackContent';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100/30">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Completing login...</h1>
        <p className="text-gray-600 mt-2">You will be redirected shortly.</p>
      </div>
    </div>
  );
}

export function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

export default GoogleCallbackPage;
