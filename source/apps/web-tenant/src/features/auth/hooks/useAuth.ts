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
    mutationFn: (credentials: LoginDto) => authService.login(credentials),
    onSuccess: (data) => {
      console.log('[useLogin] Login successful, storing tokens:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn,
      });
      
      // Store auth token in both localStorage and cookie
      if (typeof window !== 'undefined') {
        // localStorage for client-side access
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken); // Store refreshToken in localStorage too
        
        // Cookie for server-side middleware access
        const maxAge = data.expiresIn || 3600; // Default 1 hour
        document.cookie = `authToken=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${maxAge * 7}; SameSite=Lax`; // Refresh token lasts longer
        
        console.log('[useLogin] Tokens stored in localStorage and cookies');
      }
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('[useLogin] Login failed:', error);
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
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
