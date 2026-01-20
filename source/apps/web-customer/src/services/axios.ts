'use client';

import axios from 'axios';
import { log, logError } from '@/shared/logging/logger';

// Orval-generated code already includes /api/v1 prefix in URLs
// So baseURL should be http://localhost:3000 WITHOUT /api/v1
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';

// Log API URL on initialization for debugging
if (typeof window !== 'undefined') {
  log('data', 'API Base URL configured', { baseURL, mockMode: useMockData }, { feature: 'api' });
}

/**
 * Axios instance for API calls
 * - withCredentials: true → Browser sends HttpOnly cookies (table_session_id)
 * - baseURL: Configured from env with /api/v1 prefix
 * - Session-based auth for customer app (no JWT token)
 */
export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // Enable cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add logging and customer auth token
api.interceptors.request.use(
  (config) => {
    const safeUrl = config.url?.split('?')[0];
    
    // Add customer auth token if available (for logged-in customers)
    if (typeof window !== 'undefined') {
      // Check multiple possible token storage keys
      const customerToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    }
    
    if (logDataEnabled) {
      log('data', 'API Request', {
        method: config.method?.toUpperCase(),
        url: safeUrl,
      }, { feature: 'api' });
    }
    
    return config;
  },
  (error) => {
    logError('data', 'Request interceptor error', error, { feature: 'api' });
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
api.interceptors.response.use(
  (response) => {
    if (logDataEnabled) {
      log('data', 'API Response', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url?.split('?')[0],
        status: response.status,
      }, { feature: 'api' });
    }
    return response;
  },
  (error) => {
    // Handle 401 - Session expired or invalid
    if (error.response?.status === 401) {
      logError('data', 'Session expired or invalid - redirecting to invalid-qr', null, { feature: 'api' });
      if (typeof window !== 'undefined') {
        window.location.href = '/invalid-qr?reason=session-expired';
      }
    }
    
    logError('data', 'API Error', error, { feature: 'api' });
    
    return Promise.reject(error);
  }
);

/**
 * Orval Custom Mutator
 * 
 * Purpose: Unwrap backend response format { success, data } → data
 * Used by all generated API functions from Orval
 * 
 * Backend Response Format:
 * ```json
 * {
 *   "success": true,
 *   "data": { ... actual data ... },
 *   "timestamp": "2026-01-15T00:00:00.000Z",
 *   "path": "/api/v1/...",
 *   "method": "GET"
 * }
 * ```
 * 
 * This function returns only the `data` part to match TypeScript types
 */
export const customInstance = async <T>(config: any): Promise<T> => {
  const startTime = Date.now();
  
  return api(config)
    .then(({ data }) => {
      const duration = Date.now() - startTime;
      
      if (logDataEnabled) {
        log('data', 'Response received', {
          method: config.method?.toUpperCase(),
          url: config.url,
          duration: `${duration}ms`,
          hasDataProperty: data && typeof data === 'object' && 'data' in data,
        }, { feature: 'api' });
      }
      
      // Backend wraps response in { success: true, data: {...} }
      // Unwrap it to return the actual data
      if (data && typeof data === 'object' && 'data' in data) {
        if (logDataEnabled) {
          log('data', 'Unwrapping response.data.data', {}, { feature: 'api' });
        }
        return data.data as T;
      }
      
      // Some endpoints might return data directly (edge case)
      return data as T;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      
      // Don't log canceled requests (component unmount, React StrictMode, etc.)
      if (error.code !== 'ERR_CANCELED' && error.message !== 'canceled') {
        logError('data', 'API call failed', error, { feature: 'api' });
      }
      
      throw error;
    });
};
