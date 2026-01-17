'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function UnauthorizedPage() {
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
          // Redirect based on role
          if (userRole === 'OWNER') {
            router.push('/admin/dashboard');
          } else if (userRole === 'STAFF') {
            router.push('/waiter');
          } else if (userRole === 'KITCHEN') {
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
    if (userRole === 'OWNER') return 'Admin Dashboard';
    if (userRole === 'STAFF') return 'Waiter Dashboard';
    if (userRole === 'KITCHEN') return 'Kitchen Dashboard';
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
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            {userRole && (
              <span className="block mt-2 text-sm">
                Your role: <span className="font-semibold">{userRole}</span>
              </span>
            )}
          </p>

          {/* Countdown */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Redirecting to {getRoleDashboard()} in
            </p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {countdown}
            </p>
            <p className="text-xs text-gray-500 mt-1">seconds</p>
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => {
              if (userRole === 'OWNER') {
                router.push('/admin/dashboard');
              } else if (userRole === 'STAFF') {
                router.push('/waiter');
              } else if (userRole === 'KITCHEN') {
                router.push('/kds');
              } else {
                router.push('/home');
              }
            }}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go Now
          </button>
        </div>
      </div>
    </div>
  );
}
