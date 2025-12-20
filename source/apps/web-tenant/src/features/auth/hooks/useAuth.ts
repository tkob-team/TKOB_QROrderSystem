/**
 * Auth React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
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
      return authService.login(loginData as LoginDto);
    },
    onSuccess: (data) => {
      console.log('[useLogin] Login successful, storing tokens:', {
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
      
      if (typeof window !== 'undefined') {
        // Store in sessionStorage or localStorage based on rememberMe
        storage.setItem('authToken', data.accessToken);
        storage.setItem('refreshToken', data.refreshToken);
        
        // Clean up temporary flag
        sessionStorage.removeItem('__rememberMe');
        
        console.log(`[useLogin] Tokens stored in ${rememberMe ? 'localStorage' : 'sessionStorage'} (Remember me: ${rememberMe})`);
        
        // Always set cookies for middleware (server-side)
        const maxAge = data.expiresIn || 3600; // Default 1 hour
        document.cookie = `authToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${maxAge * 7}; SameSite=Lax`; // Refresh token lasts longer
        
        console.log('[useLogin] Cookies set for middleware');
      }
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('[useLogin] Login failed:', error);
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
    mutationFn: (data: RegisterSubmitDto) => authService.registerSubmit(data),
  });
};

/**
 * Registration step 2: Confirm OTP
 */
export const useRegisterConfirm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterConfirmDto) => authService.registerConfirm(data),
    onSuccess: (data) => {
      // Store auth token in both localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken); // Store refreshToken in localStorage too
        const maxAge = data.expiresIn || 3600;
        document.cookie = `authToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${maxAge * 7}; SameSite=Lax`;
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
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (data) => {
      // Update auth token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.accessToken);
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
      console.log('[useLogout] Starting logout with refreshToken:', !!refreshToken);
      console.log('[useLogout] authToken in localStorage:', !!localStorage.getItem('authToken'));
      
      try {
        await authService.logout(refreshToken);
        console.log('[useLogout] Logout successful, clearing local data');
      } catch (error) {
        console.error('[useLogout] Logout failed:', error);
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
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Lax';
      }
      // Clear all queries
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      console.warn('[useLogout] Server logout failed, clearing local data anyway');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authToken');
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
    mutationFn: () => authService.logoutAll(),
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
    queryFn: () => authService.getCurrentUser(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
