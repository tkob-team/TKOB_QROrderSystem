// Feature-owned QR handler controller - Logic extracted from /t/[qrToken]/page.tsx

'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { USE_MOCK_API } from '@/shared/config';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { TableDataFactory } from '../data';
import type { SessionInfo } from '../data';
import { setStoredSession } from '../utils/sessionStorage';

interface UseQRHandlerProps {
  qrToken: string;
}

export function useQRHandler({ qrToken }: UseQRHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // Validate token exists
    if (!qrToken) {
      logError('ui', '[QR] Missing QR token parameter', null, { feature: 'tables', route: '/t/[qrToken]' });
      window.location.href = '/invalid-qr?reason=missing-token';
      return;
    }

    log('data', '[QR] Processing QR token', { hasToken: true }, { feature: 'tables', route: '/t/[qrToken]' });

    // MOCK mode: Handle QR validation client-side
    if (USE_MOCK_API) {
      handleMockQR(qrToken, router);
      return;
    }

    // REAL mode: Redirect to backend endpoint
    // Backend will validate, create session, set cookie, and redirect to /menu
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
    const backendUrl = `${apiUrl}/t/${qrToken}`;
    
    log('data', '[QR] Redirecting to backend (REAL mode)', { backendUrl }, { feature: 'tables', route: '/t/[qrToken]' });
    
    // Use window.location.href to allow backend 302 redirect
    // This ensures cookie is properly set before final navigation
    window.location.href = backendUrl;
  }, [qrToken, router]);
}

/**
 * Handle QR validation in MOCK mode (client-side)
 */
async function handleMockQR(token: string, router: ReturnType<typeof useRouter>) {
  try {
    const strategy = TableDataFactory.getStrategy();
    const result = await strategy.validateQRToken(token);

    log('data', '[QR] MOCK validation result', { success: result.success }, { feature: 'tables', route: '/t/[qrToken]' });

    if (!result.success) {
      logError('data', '[QR] MOCK validation failed', { message: result.message }, { feature: 'tables', route: '/t/[qrToken]' });
      router.push('/invalid-qr?reason=invalid-token');
      return;
    }

    // Validation succeeded; create session with token-specific data
    const session: SessionInfo = {
      sessionId: `mock-session-${Date.now()}`,
      tableId: result.data.table.id,
      tableNumber: result.data.table.number,
      restaurantName: result.data.restaurant.name || 'The Golden Spoon',
      tenantId: result.data.restaurant.id || 'mock-tenant',
      active: true,
      createdAt: new Date().toISOString(),
    };

    log('data', '[QR] MOCK session created', { sessionId: maskId(session.sessionId), tableId: maskId(session.tableId) }, { feature: 'tables', route: '/t/[qrToken]' });

    // Persist session to localStorage so useSession can retrieve it
    setStoredSession(session);

    log('ui', '[QR] MOCK session stored; navigating to /', null, { feature: 'tables', route: '/t/[qrToken]' });

    // Navigate to landing (app entry point after session created)
    router.push('/');
  } catch (err) {
    logError('data', '[QR] MOCK QR handling error', err, { feature: 'tables', route: '/t/[qrToken]' });
    router.push('/invalid-qr?reason=error');
  }
}
