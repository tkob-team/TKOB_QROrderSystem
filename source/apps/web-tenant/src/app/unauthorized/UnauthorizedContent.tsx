'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = searchParams.get('role');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Redirect based on role - using lowercase values that match UserRole
          if (userRole === 'admin') {
            router.push('/admin/dashboard');
          } else if (userRole === 'waiter') {
            router.push('/waiter');
          } else if (userRole === 'kds') {
            router.push('/kds');
          } else {
            router.push('/home');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, userRole]);

  const getRoleDashboard = () => {
    if (userRole === 'admin') return 'Admin Dashboard';
    if (userRole === 'waiter') return 'Waiter Dashboard';
    if (userRole === 'kds') return 'Kitchen Dashboard';
    return 'Home';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            Access Unauthorized
          </h1>

          {/* Message */}
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this application with the current role.
          </p>

          {/* Countdown */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              Redirecting you to{' '}
              <span className="font-semibold">{getRoleDashboard()}</span> in{' '}
              <span className="font-bold text-blue-600">{countdown}</span> seconds...
            </p>
          </div>

          {/* Manual Redirect */}
          <button
            onClick={() => {
              if (userRole === 'admin') {
                router.push('/admin/dashboard');
              } else if (userRole === 'waiter') {
                router.push('/waiter');
              } else if (userRole === 'kds') {
                router.push('/kds');
              } else {
                router.push('/home');
              }
            }}
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Now
          </button>

          {/* Footer */}
          <p className="mt-4 text-xs text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
