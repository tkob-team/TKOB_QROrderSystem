// Real Auth Adapter for customer feature
// Uses /customer/auth/* endpoints (separate from tenant user auth)

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { IAuthAdapter, User } from '../adapter.interface';

export class AuthAdapter implements IAuthAdapter {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/customer/auth/me');
    // Map backend response to frontend User type
    const data = response.data?.data || response.data;
    if (data) {
      return {
        success: true,
        data: {
          id: data.id,
          email: data.email,
          name: data.fullName || data.name || '',
          avatar: data.avatarUrl || data.avatar,
        }
      };
    }
    return response.data;
  }

  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    // Backend expects PATCH /customer/auth/me with { fullName }
    const response = await apiClient.patch('/customer/auth/me', { fullName: data.name });
    // Map response back to frontend User type
    const userData = response.data?.data || response.data;
    if (userData) {
      return {
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.fullName || userData.name || '',
          avatar: userData.avatarUrl || userData.avatar,
        }
      };
    }
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/customer/auth/change-password', data);
    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/customer/auth/login', data);
    // Store tokens from response
    const result = response.data?.data || response.data;
    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
    }
    // Map customer to User
    if (result?.customer) {
      return {
        success: true,
        data: {
          id: result.customer.id,
          email: result.customer.email,
          name: result.customer.fullName || '',
          avatar: result.customer.avatarUrl,
        }
      };
    }
    return response.data;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/customer/auth/logout');
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/customer/auth/register', data);
    return response.data;
  }

  async requestPasswordReset(data: {
    email: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/customer/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/customer/auth/reset-password', {
      email: data.token, // token is actually email in OTP flow
      otp: data.password, // This needs to be fixed in the UI to send { email, otp, newPassword }
      newPassword: data.password,
    });
    return response.data;
  }

  async verifyEmail(data: {
    token: string;
  }): Promise<ApiResponse<{ message: string }>> {
    // For OTP flow, this needs email + otp
    // The token format should be "email:otp" or the UI needs to be updated
    const response = await apiClient.post('/customer/auth/verify-email', data);
    return response.data;
  }

  async resendVerification(data: {
    email: string;
  }): Promise<ApiResponse<{ message: string }>> {
    // Re-register triggers new OTP
    const response = await apiClient.post('/customer/auth/register', {
      email: data.email,
      password: '', // Won't create new user if exists
    });
    return response.data;
  }
}
