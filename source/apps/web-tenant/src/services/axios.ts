'use client';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { logger } from '@/shared/utils/logger';
import { toAppError } from '@/shared/utils/toAppError';
import { inspectRequestParams, inspectResponseShape, samplePayload } from '@/shared/utils/dataInspector';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

// Request ID generation (timestamp + counter for uniqueness)
let requestCounter = 0;
const generateRequestId = (): string => {
  const timestamp = Date.now();
  const counter = ++requestCounter;
  return `${timestamp}-${counter}`;
};

// Extended config type to include our tracking metadata
interface TrackedRequestConfig extends InternalAxiosRequestConfig {
  _requestId?: string;
  _startTime?: number;
}

// Log API URL on initialization for debugging
if (typeof window !== 'undefined') {
  logger.log('[axios] API Base URL:', baseURL);
  logger.log('[axios] Mock Mode:', useMockData ? 'ENABLED' : 'DISABLED (Real API)');
}

export const api = axios.create({
  baseURL,
  timeout: 30000, // 30s for registration with seed data
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

api.interceptors.request.use((config: TrackedRequestConfig) => {
  // Generate unique request ID and record start time
  config._requestId = generateRequestId();
  config._startTime = Date.now();

  // Log REQUEST with requestId, method, url (no headers, no body)
  // Strip query params from URL to prevent PII leakage (defense in depth)
  const safeUrl = config.url?.split('?')[0];
  logger.debug('[api] REQUEST', {
    requestId: config._requestId,
    method: config.method?.toUpperCase(),
    url: safeUrl,
  });

  if (logDataEnabled) {
    const safeParams = inspectRequestParams(config.params as Record<string, unknown>);
    if (safeParams) {
      logger.info('[data] REQUEST_PARAMS', {
        requestId: config._requestId,
        params: safeParams,
      });
    }
  }

  if (logFullDataEnabled && config.data !== undefined) {
    logger.info('[data] REQUEST_BODY', {
      requestId: config._requestId,
      body: samplePayload(config.data),
    });
  }

  // INVARIANT: Check for missing tenantId in tenant-scoped API calls
  // Tenant-scoped routes are any non-auth routes (auth is the only public API)
  if (config.url && !config.url.includes('/auth/') && !config.url.includes('/health')) {
    // In real API mode, tenantId should come from JWT token claims (backend extracts it)
    // But we can check if token exists for tenant-scoped routes
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
      : null;
    
    if (!token && !useMockData) {
      logger.warn('[invariant] MISSING_AUTH_TOKEN_FOR_TENANT_API', {
        requestId: config._requestId,
        url: config.url,
        method: config.method?.toUpperCase(),
      });
    }
  }

  // Skip real API calls when mock mode is enabled
  if (useMockData) {
    logger.log('[axios] Mock Mode - Skipping real API call:', config.method?.toUpperCase(), config.url);
    // Return a rejected promise that will be caught by React Query
    // React Query will then use the mock data from query functions
    const mockError = new Error('Mock mode enabled - using mock data instead of real API');
    (mockError as any).isMockMode = true;
    return Promise.reject(mockError);
  }

  try {
    // Check both localStorage (Remember me) and sessionStorage (session-only)
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
      : null;
    if (token) {
      config.headers = (config.headers || {}) as any;
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    logger.error('[axios] Error attaching token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Log successful RESPONSE with requestId, method, url, status, durationMs
    const config = response.config as TrackedRequestConfig;
    const durationMs = config._startTime ? Date.now() - config._startTime : undefined;
    // Strip query params from URL to prevent PII leakage (defense in depth)
    const safeUrl = config.url?.split('?')[0];
    
    logger.debug('[api] RESPONSE', {
      requestId: config._requestId,
      method: config.method?.toUpperCase(),
      url: safeUrl,
      status: response.status,
      durationMs,
    });

    if (logDataEnabled) {
      const shapeSummary = inspectResponseShape(response.data);
      logger.info('[data] RESPONSE_SHAPE', {
        requestId: config._requestId,
        ...shapeSummary,
      });
    }

    if (logFullDataEnabled) {
      logger.info('[data] RESPONSE_BODY', {
        requestId: config._requestId,
        body: samplePayload(response.data),
      });
    }

    return response;
  },
  (error) => {
    // Log ERROR with requestId, method, url, statusOrCode, durationMs, message
    const config = error.config as TrackedRequestConfig;
    if (config) {
      const durationMs = config._startTime ? Date.now() - config._startTime : undefined;
      const statusOrCode = error.response?.status || error.code || 'UNKNOWN';
      const message = error.response?.data?.message || error.message || 'Request failed';
      // Strip query params from URL to prevent PII leakage (defense in depth)
      const safeUrl = config.url?.split('?')[0];

      logger.error('[api] ERROR', {
        requestId: config._requestId,
        method: config.method?.toUpperCase(),
        url: safeUrl,
        statusOrCode,
        durationMs,
        message,
      });

      if (logDataEnabled && error.response?.data) {
        const shapeSummary = inspectResponseShape(error.response.data);
        logger.info('[data] RESPONSE_SHAPE', {
          requestId: config._requestId,
          ...shapeSummary,
        });
      }

      if (logFullDataEnabled && error.response?.data) {
        logger.info('[data] RESPONSE_BODY', {
          requestId: config._requestId,
          body: samplePayload(error.response.data),
        });
      }
    }

    const originalRequest = error.config as TrackedRequestConfig & { _retry?: boolean };

    // Skip refresh logic for the refresh endpoint itself to avoid infinite loop
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    // Handle 401 errors - try to refresh token (but not for refresh endpoint)
    if (error?.response?.status === 401 && typeof window !== 'undefined' && !originalRequest._retry && !isRefreshRequest) {
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
          logger.warn('[axios] No refresh token found, clearing auth state');
          isRefreshing = false;
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          // Clear cookies with all possible attributes to ensure removal
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          processQueue(error, null);
          
          // Redirect to home (/) to allow user to login or signup
          const isPublicPage = window.location.pathname.startsWith('/auth/') || 
                               window.location.pathname === '/' ||
                               window.location.pathname === '/home';
          if (!isPublicPage) {
            logger.log('[axios] No refresh token, redirecting to home...');
            window.location.href = '/';
          }
          reject(error);
          return;
        }

        logger.log('[axios] Attempting to refresh token...');

        // Make refresh request with minimal headers (no token needed)
        api.post('/api/v1/auth/refresh', { refreshToken }, {
          headers: {
            Authorization: '', // Don't send old token
          },
        })
          .then((response) => {
            const { accessToken } = response.data;
            logger.log('[axios] Token refreshed successfully');

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
            logger.error('[axios] Token refresh failed:', refreshError);
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            // Clear cookies with all possible attributes to ensure removal
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            processQueue(refreshError, null);

            // Redirect to home (/) to allow user to login or signup
            const isPublicPage = window.location.pathname.startsWith('/auth/') || 
                                 window.location.pathname === '/' ||
                                 window.location.pathname === '/home';
            if (!isPublicPage) {
              logger.warn('[axios] Refresh failed, redirecting to home...');
              // Use replace to ensure redirect happens and prevent back navigation to broken state
              window.location.replace('/');
              return; // Stop execution after redirect
            }
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      logger.warn('[axios] 401 Unauthorized - Token may be invalid or expired, URL:', originalRequest?.url);
      logger.warn('[axios] isRefreshRequest:', isRefreshRequest, 'originalRequest._retry:', originalRequest?._retry);
      
      // Clear from both storages
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      // Clear cookies with all possible attributes to ensure removal
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      logger.warn('[axios] Cleared all auth tokens and cookies');
      
      // Redirect to home for any 401 (refresh failed or other auth error)
      const isPublicPage = window.location.pathname.startsWith('/auth/') || 
                           window.location.pathname === '/' ||
                           window.location.pathname === '/home';
      
      logger.warn('[axios] Current pathname:', window.location.pathname, 'isPublicPage:', isPublicPage);
      
      if (!isPublicPage) {
        logger.warn('[axios] Redirecting to home NOW...');
        window.location.replace('/');
        return Promise.reject(error); // Return immediately after redirect
      }
    }
    // Ensure we reject with an Error instance, not a plain object or undefined
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    
    // Normalize any non-Error value to AppError
    const appError = toAppError(error, 'axios-response-error');
    return Promise.reject(appError);
  }
);

// Orval custom mutator function
export const customInstance = async <T>(config: any): Promise<T> => {
  const startTime = Date.now();
  logger.log('[customInstance] Request:', {
    method: config.method,
    url: config.url,
    baseURL: baseURL,
    params: config.params,
    hasData: !!config.data,
  });
  
  return api(config).then(({ data }) => {
    const duration = Date.now() - startTime;
    logger.log('[customInstance] Response received:', {
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
      logger.log('[customInstance] Unwrapping data.data');
      return data.data as T;
    }
    logger.log('[customInstance] Returning data as-is');
    return data;
  }).catch((error) => {
    const duration = Date.now() - startTime;
    
    // Skip all error logging when in mock mode
    if (error.isMockMode) {
      throw error; // Silently reject for mock mode
    }
    
    const errorData = error.response?.data || {};
    
    // Skip logging for canceled requests (React Strict Mode behavior)
    if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
      // Silently skip - this is normal in React 18 Strict Mode (dev only)
      throw error;
    }
    
    // Better error logging with proper error info extraction
    const errorInfo = {
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: config.url || 'UNKNOWN',
      duration: `${duration}ms`,
      status: error.response?.status || error.code || 'UNKNOWN',
      statusText: error.response?.statusText || '',
      errorMessage: errorData?.error?.message || errorData?.message || error.message || 'Unknown error',
      // removed hasToken to avoid logging auth header presence
    };
    
    // Only log 5xx server errors at error level, handle 4xx as expected business errors
    const isServerError = error.response?.status && error.response.status >= 500;
    const isValidationError = error.response?.status && error.response.status >= 400 && error.response.status < 500;
    const isConflict = error.response?.status === 409;
    
    if (isServerError) {
      logger.error('[customInstance] Server Error (5xx):', errorInfo.method, errorInfo.url, 'Status:', errorInfo.status);
      logger.error('[customInstance] Server Response Status:', error.response.status);
      if (errorInfo.errorMessage) {
        logger.error('[customInstance] Error Details:', errorInfo.errorMessage);
      }
    } else if (isValidationError) {
      // 4xx errors are expected (validation, conflicts, not found, etc) - only log at debug/info level
      logger.debug('[customInstance] Client/Validation Error:', errorInfo.method, errorInfo.url, 'Status:', errorInfo.status);
      
      // For 400 errors, provide validation details
      if (error.response?.status === 400) {
        logger.debug('[customInstance] Bad Request (400) - URL:', config.url);
        if (errorData?.message || errorData?.error) {
          logger.debug('[customInstance] Validation errors:', errorData?.message || errorData?.error);
        }
      }
      
      // For 409 Conflict, suppress the error display since it's handled by the UI
      if (isConflict) {
        logger.debug('[customInstance] Conflict (409) - Action cannot be performed');
        // Mark the error as a handled business error so React won't display it
        (error as any).__isHandledBusinessError = true;
        (error as any).__userMessage = errorData?.error?.message || errorData?.message || 'Conflict: Action cannot be performed';
      }
    } else {
      // Network errors or unknown
      logger.error('[customInstance] Request Failed:', errorInfo.method, errorInfo.url, 'Status:', errorInfo.status);
    }
    
    // Log network/connection errors
    if (error.request && !error.response) {
      logger.error('[customInstance] Request Error (No Response) - Cannot connect to backend API server');
      logger.error('[customInstance] Message:', error.message);
      logger.error('[customInstance] Code:', error.code);
      logger.error('[customInstance] API URL:', baseURL, 'Endpoint:', config.url);
      logger.error('[customInstance] Request Method:', config.method);
    }
    
    throw error;
  });
};

export default api;
