/**
 * Auth API Adapter
 * Real API implementation using Orval generated functions
 */

import type { IAuthAdapter } from './types';
import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from '@/services/generated/models';
import {
  authControllerLogin,
  authControllerRegisterSubmit,
  authControllerRegisterConfirm,
  authControllerRefresh,
  authControllerLogout,
  authControllerLogoutAll,
  authControllerGetMe,
} from '@/services/generated/authentication/authentication';

export class AuthApiAdapter implements IAuthAdapter {
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    return authControllerLogin(credentials);
  }

  async registerSubmit(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return authControllerRegisterSubmit(data);
  }

  async registerConfirm(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    return authControllerRegisterConfirm(data);
  }

  async refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }> {
    return authControllerRefresh(data);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      console.warn('[AuthApiAdapter] No refresh token provided for logout - will still attempt');
    }
    
    try {
      await authControllerLogout({ refreshToken: refreshToken || '' });
      console.log('[AuthApiAdapter] Logout successful on server');
    } catch (error: any) {
      // If it's a network error, log but don't throw - allow local logout
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        console.warn('[AuthApiAdapter] Server logout failed due to network error - continuing with local logout');
        console.warn('[AuthApiAdapter] Make sure the backend API server is running at', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');
        return; // Don't throw, allow local logout to proceed
      }
      // For other errors, rethrow
      throw error;
    }
  }

  async logoutAll(): Promise<void> {
    await authControllerLogoutAll();
  }

  async getCurrentUser(): Promise<{
    user: AuthResponseDto['user'];
    tenant: AuthResponseDto['tenant'];
  }> {
    return authControllerGetMe();
  }
}
