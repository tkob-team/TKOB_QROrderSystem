/**
 * Auth React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAdapter } from '@/features/auth/data/factory';
import { logger } from '@/shared/utils/logger';
import { api } from '@/services/axios';
import type {
  LoginDto,
  RegisterSubmitDto,
  RegisterConfirmDto,
} from '@/services/generated/models';

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: any) => {
      // Extract rememberMe before sending to API
      const { rememberMe, ...loginData } = credentials;
      // Store rememberMe flag in sessionStorage temporarily for onSuccess to access
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('__rememberMe', rememberMe ? 'true' : 'false');
      }
      return authAdapter.login(loginData as LoginDto);
    },
    onSuccess: (data) => {
      logger.info('[auth] LOGIN_TOKENS_STORED', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn,
      });
      
      // Get rememberMe flag from sessionStorage
      const rememberMe = typeof window !== 'undefined' 
        ? sessionStorage.getItem('__rememberMe') === 'true'
        : false;
      
      // Choose storage based on "Remember me" preference
      const storage = rememberMe ? localStorage : sessionStorage;
      
      if (typeof window !== 'undefined' && data.accessToken) {
        // Store in sessionStorage or localStorage based on rememberMe
        storage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          storage.setItem('refreshToken', data.refreshToken);
        }
        
        // 🔑 CRITICAL: Update axios default header immediately to prevent race condition
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Clean up temporary flag
        sessionStorage.removeItem('__rememberMe');
        
        logger.debug('[auth] LOGIN_STORAGE_METHOD', { storageType: rememberMe ? 'localStorage' : 'sessionStorage', rememberMe });
        
        // Always set cookies for middleware (server-side)
        const maxAge = data.expiresIn || 3600; // Default 1 hour
        document.cookie = `authToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${maxAge * 7}; SameSite=Lax`; // Refresh token lasts longer
        
        logger.debug('[auth] LOGIN_COOKIES_SET', { maxAge });
      }
      // Invalidate current user query to trigger refetch with new token
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      logger.error('[auth] LOGIN_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
      // Clean up flag on error
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('__rememberMe');
      }
    },
  });
};

/**
 * Registration step 1: Submit
 */
export const useRegisterSubmit = () => {
  return useMutation({
    mutationFn: (data: RegisterSubmitDto) => authAdapter.signup(data as any),
  });
};

/**
 * Registration step 2: Confirm OTP
 */
export const useRegisterConfirm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterConfirmDto) => authAdapter.verifyOtp(data as any),
    onSuccess: (data) => {
      // Store auth token in both localStorage and cookie
      if (typeof window !== 'undefined' && data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken); 
        }
        
        // 🔑 CRITICAL: Update axios default header immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        const maxAge = data.expiresIn || 3600;
        document.cookie = `authToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        if (data.refreshToken) {
          document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${maxAge * 7}; SameSite=Lax`;
        }
      }
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

/**
 * Refresh token mutation
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authAdapter.refreshToken({ refreshToken }),
    onSuccess: (data) => {
      // Update auth token
      if (typeof window !== 'undefined' && data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        // 🔑 Update axios default header immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      }
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      // Make sure we have the token before logout
      logger.debug('[auth] LOGOUT_ATTEMPT', { hasRefreshToken: !!refreshToken, hasAuthToken: !!localStorage.getItem('authToken') });
      
      try {
        await authAdapter.logout(refreshToken);
        logger.info('[auth] LOGOUT_SUCCESS');
      } catch (error) {
        logger.error('[auth] LOGOUT_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
    onSuccess: () => {
      // Clear auth data AFTER successful logout
      if (typeof window !== 'undefined') {
        // Clear from both storages
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        // Clear both authToken and refreshToken cookies
        
        // 🔑 Clear axios default header
        delete api.defaults.headers.common['Authorization'];
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Lax';
      }
      // Clear all queries
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      logger.warn('[auth] LOGOUT_LOCAL_CLEAR_FALLBACK', { reason: 'server logout failed' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authToken');
        
        // 🔑 Clear axios default header
        delete api.defaults.headers.common['Authorization'];
        sessionStorage.removeItem('refreshToken');
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Lax';
      }
      queryClient.clear();
    },
  });
};

/**
 * Logout all devices mutation
 */
export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAdapter.logoutAll(),
    onSuccess: () => {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Clear both authToken and refreshToken cookies
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Lax';
      }
      // Clear all queries
      queryClient.clear();
    },
  });
};

/**
 * Get current user query
 */
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAdapter.getCurrentUser(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
