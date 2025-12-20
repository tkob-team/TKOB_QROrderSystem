// Axios client configuration

import axios, { AxiosInstance, AxiosError } from 'axios';
import { USE_MOCK_API, API_MODE } from '@/lib/constants';
import { NetworkError } from '@/lib/errors';
import { createErrorFromStatus } from '@/lib/errorMessages';

/**
 * Create Real API Client (Axios)
 * 
 * Configuration for Haidilao-style session authentication:
 * - withCredentials: true → Browser sends HttpOnly cookies automatically
 * - baseURL includes /api/v1 prefix
 * - Handles 401 errors → Redirect to invalid-qr page
 */
function createRealAPIClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    timeout: 10000,
    withCredentials: true,  // Enable cookies (table_session_id)
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if exists
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle 401 - Session expired or invalid
      if (error.response?.status === 401) {
        console.error('[API] Session expired or invalid - redirecting to invalid-qr')
        if (typeof window !== 'undefined') {
          window.location.href = '/invalid-qr?reason=session-expired'
        }
        throw new NetworkError('Session expired. Please scan QR code again.')
      }
      
      // Transform errors to custom error classes
      if (error.response) {
        // Server responded with error status
        const statusCode = error.response.status
        const message = (error.response.data as any)?.message || error.message
        throw createErrorFromStatus(statusCode, message)
      } else if (error.request) {
        // Request made but no response
        throw new NetworkError('Network error. Please check your connection.')
      } else {
        // Error setting up request
        throw new NetworkError(error.message)
      }
    }
  );

  return client;
}

/**
 * Mock API Client (placeholder for now, uses axios structure)
 * Services will handle mock logic
 */
function createMockAPIClient(): AxiosInstance {
  // For now, return same structure as real client
  // Services will intercept and use mock handlers
  const client = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
  });
  
  if (process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
    console.log('[MOCK API] Client initialized');
  }
  
  return client;
}

// Export unified client based on mode
const apiClient = USE_MOCK_API ? createMockAPIClient() : createRealAPIClient();

if (typeof window !== 'undefined') {
  console.log(`[API] Running in ${API_MODE.toUpperCase()} mode`);
}

export default apiClient;
