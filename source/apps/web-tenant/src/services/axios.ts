'use client';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Log API URL on initialization for debugging
if (typeof window !== 'undefined') {
  console.log('🔧 [axios] API Base URL:', baseURL);
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already trying to refresh to avoid duplicate requests
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFail: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.onFail(error);
    } else {
      prom.onSuccess(token!);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  try {
    // Check both localStorage (Remember me) and sessionStorage (session-only)
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
      : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      console.log(`🔑 [axios] Token attached to request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`⚠️ [axios] No token found in localStorage or sessionStorage for: ${config.method?.toUpperCase()} ${config.url}`);
    }
  } catch (error) {
    console.error('🔑 [axios] Error attaching token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - try to refresh token
    if (error?.response?.status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while we're refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            onFail: (error) => {
              reject(error);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh token
      return new Promise((resolve, reject) => {
        const refreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refreshToken='))
          ?.split('=')[1];

        if (!refreshToken) {
          console.warn('⚠️ [axios] No refresh token found, clearing auth state');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          processQueue(error, null);
          
          if (!window.location.pathname.includes('/login')) {
            console.log('🔄 [axios] Redirecting to login page...');
            window.location.href = '/auth/login';
          }
          reject(error);
          return;
        }

        console.log('🔄 [axios] Attempting to refresh token...');

        // Make refresh request with minimal headers (no token needed)
        api.post('/api/v1/auth/refresh', { refreshToken }, {
          headers: {
            Authorization: '', // Don't send old token
          },
        })
          .then((response) => {
            const { accessToken } = response.data;
            console.log('✅ [axios] Token refreshed successfully');

            // Update token in storage (check which storage was used)
            if (localStorage.getItem('authToken')) {
              localStorage.setItem('authToken', accessToken);
            } else {
              sessionStorage.setItem('authToken', accessToken);
            }

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);

            // Retry original request
            resolve(api(originalRequest));
          })
          .catch((refreshError) => {
            console.error('❌ [axios] Token refresh failed:', refreshError);
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            processQueue(refreshError, null);

            if (!window.location.pathname.includes('/login')) {
              console.log('🔄 [axios] Refresh failed, redirecting to login page...');
              window.location.href = '/auth/login';
            }
            reject(refreshError);
          });
      });
    }

    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('⚠️ [axios] 401 Unauthorized - Token may be invalid or expired');
      // Clear from both storages
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 [axios] Redirecting to login page...');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Orval custom mutator function
export const customInstance = <T>(config: any): Promise<T> => {
  const startTime = Date.now();
  console.log('🌐 [customInstance] Request:', {
    method: config.method,
    url: config.url,
    fullURL: `${baseURL}${config.url}`,
    baseURL: baseURL,
    params: config.params,
    hasData: !!config.data,
  });
  
  return api(config).then(({ data }) => {
    const duration = Date.now() - startTime;
    console.log('🌐 [customInstance] Response received:', {
      method: config.method,
      url: config.url,
      duration: `${duration}ms`,
      rawData: data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasDataProperty: data && typeof data === 'object' && 'data' in data,
    });
    
    // Backend wraps response in { success: true, data: {...} }
    // Unwrap it to return the actual data
    if (data && typeof data === 'object' && 'data' in data) {
      console.log('🌐 [customInstance] Unwrapping data.data:', data.data);
      return data.data as T;
    }
    console.log('🌐 [customInstance] Returning data as-is:', data);
    return data;
  }).catch((error) => {
    const duration = Date.now() - startTime;
    const errorData = error.response?.data || {};
    
    // Better error logging with proper error info extraction
    const errorInfo = {
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: config.url || 'UNKNOWN',
      duration: `${duration}ms`,
      status: error.response?.status || error.code || 'UNKNOWN',
      statusText: error.response?.statusText || '',
      errorMessage: errorData?.error?.message || errorData?.message || error.message || 'Unknown error',
      hasToken: !!(config.headers?.Authorization),
    };
    
    // Use proper object logging to avoid serialization issues
    console.error('🌐 [customInstance] Request Failed:', JSON.stringify(errorInfo, null, 2));
    
    // Log full error response data if available
    if (error.response) {
      // For 400 errors, provide validation details
      if (error.response.status === 400) {
        console.warn('⚠️ [customInstance] Bad Request (400) - URL:', config.url);
        console.warn('⚠️ [customInstance] Validation errors:', errorData?.message || errorData?.error);
        console.warn('⚠️ [customInstance] Full details:', JSON.stringify(errorData, null, 2));
      }
      
      console.error('🌐 [customInstance] Server Response - Status:', error.response.status);
      console.error('🌐 [customInstance] Server Response - Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('🌐 [customInstance] Request Error (No Response)');
      console.error('  ❌ Cannot connect to backend API server');
      console.error('  Message:', error.message);
      console.error('  Code:', error.code);
      console.error('  Full URL:', `${baseURL}${config.url}`);
      console.error('  Method:', config.method);
      console.error('  💡 Make sure:');
      console.error('     1. Backend server is running (pnpm start:dev in apps/api)');
      console.error('     2. NEXT_PUBLIC_API_URL is correct:', baseURL);
      console.error('     3. No firewall blocking the connection');
    } else {
      console.error('🌐 [customInstance] Error:', error.message);
    }
    
    throw error;
  });
};

export default api;
