'use client';

import { Suspense } from 'react';
import { UnauthorizedContent } from './UnauthorizedContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-md mb-2 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnauthorizedContent />
    </Suspense>
  );
}
