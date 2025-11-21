'use client';

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or headers here if needed
    // For customer app, we typically don't need authentication
    // But we might need to pass tenant/table context
    
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('customer-session');
      if (session) {
        try {
          const { tenantId, tableId } = JSON.parse(session);
          // Add session context to headers if needed by backend
          config.headers['X-Tenant-Id'] = tenantId;
          config.headers['X-Table-Id'] = tableId;
        } catch (error) {
          console.error('Failed to parse session:', error);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
