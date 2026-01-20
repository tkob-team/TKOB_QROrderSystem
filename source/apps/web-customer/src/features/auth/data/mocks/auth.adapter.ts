// Mock Auth Adapter for feature

import { authHandlers } from '@/api/mocks';
import { ApiResponse } from '@/types';
import { IAuthAdapter, User } from '../adapter.interface';

export class MockAuthAdapter implements IAuthAdapter {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return authHandlers.getCurrentUser();
  }

  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    return authHandlers.updateProfile(data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return authHandlers.changePassword(data);
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return authHandlers.login(data);
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return authHandlers.logout();
  }

  async register(data: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    // Mock implementation - just return success
    return { success: true, data: { message: 'Registration successful. Please verify your email.' } };
  }

  async verifyEmail(data: { token: string }): Promise<ApiResponse<{ message: string }>> {
    return { success: true, data: { message: 'Email verified successfully.' } };
  }

  async resendVerification(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return { success: true, data: { message: 'Verification email resent.' } };
  }

  async requestPasswordReset(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return { success: true, data: { message: 'Password reset email sent.' } };
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return { success: true, data: { message: 'Password reset successfully.' } };
  }
}
