// Axios client configuration

import axios, { AxiosInstance, AxiosError } from 'axios';
import { NetworkError } from '@/lib/errors';
import { createErrorFromStatus } from '@/lib/errorMessages';
import { logError } from '@/shared/logging/logger';

/**
 * Axios API Client
 * 
 * Configuration for session-based authentication:
 * - withCredentials: true → Browser sends HttpOnly cookies automatically
 * - baseURL includes /api/v1 prefix
 * - Handles 401 errors → Redirect to invalid-qr page
 */
function createAPIClient(): AxiosInstance {
  // Always append /api/v1 to base URL for consistency
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
  
  const client = axios.create({
    baseURL: apiUrl,
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
        logError('data', 'Session expired or invalid - redirecting to invalid-qr', null, { feature: 'api' });
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

// Export API client
const apiClient = createAPIClient();

export default apiClient;
