'use client';
import axios from 'axios';

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

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      console.log(`🔑 [axios] Token attached to request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`⚠️ [axios] No token found in localStorage for: ${config.method?.toUpperCase()} ${config.url}`);
    }
  } catch (error) {
    console.error('🔑 [axios] Error attaching token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('⚠️ [axios] 401 Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('authToken');
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
