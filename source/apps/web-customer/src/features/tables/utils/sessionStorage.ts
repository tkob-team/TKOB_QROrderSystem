// Session storage utility for client-side session persistence (MOCK mode)

import { logError } from '@/shared/logging/logger';
import type { SessionInfo } from '../data';

const SESSION_STORAGE_KEY = 'tkob_table_session';

/**
 * Get session from localStorage (MOCK mode only)
 */
export function getStoredSession(): SessionInfo | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    logError('data', '[sessionStorage] Failed to read session from localStorage', err, { feature: 'tables' });
    return null;
  }
}

/**
 * Store session to localStorage (MOCK mode only)
 */
export function setStoredSession(session: SessionInfo): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    logError('data', '[sessionStorage] Failed to store session in localStorage', err, { feature: 'tables' });
  }
}

/**
 * Clear session from localStorage
 */
export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    logError('data', '[sessionStorage] Failed to clear session from localStorage', err, { feature: 'tables' });
  }
}
