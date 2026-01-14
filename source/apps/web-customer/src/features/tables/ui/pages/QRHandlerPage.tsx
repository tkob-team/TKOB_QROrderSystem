/**
 * QR Handler Page Component (Haidilao Style)
 * 
 * Flow:
 * 1. User scans QR code → Opens this page: /t/abc123
 * 2. This page redirects browser to backend: /api/v1/t/abc123
 * 3. Backend handles:
 *    - Validates QR token from database
 *    - Creates TableSession record
 *    - Sets HttpOnly cookie: table_session_id
 *    - Redirects 302 to /menu
 * 4. Browser auto-follows redirect to /menu (with cookie)
 * 5. Menu page loads and makes API call with cookie
 * 
 * Security:
 * - Token only visible for ~1 second (during redirect)
 * - Final URL is clean: /menu (no token)
 * - Cookie is HttpOnly (JS cannot access - XSS protection)
 * 
 * @see docs-web/SO_SANH_QR_APPROACHES.md for architecture comparison
 */
'use client'

import { useQRHandler } from '../../hooks';

interface QRHandlerPageProps {
  qrToken: string;
}

export function QRHandlerPage({ qrToken }: QRHandlerPageProps) {
  useQRHandler({ qrToken });

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-50 to-gray-50">
      <div className="text-center space-y-6 p-8">
        {/* Animated Loading Spinner with Icon */}
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-pulse">🍽️</span>
          </div>
        </div>
        
        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Đang xử lý mã QR...
          </h2>
          <p className="text-sm text-gray-600">
            Vui lòng đợi trong giây lát
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
