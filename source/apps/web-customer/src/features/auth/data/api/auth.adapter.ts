// Real Auth Adapter for feature

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { IAuthAdapter, User } from '../adapter.interface';

export class AuthAdapter implements IAuthAdapter {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async requestPasswordReset(data: {
    email: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/reset-password', {
      token: data.token,
      newPassword: data.password,
    });
    return response.data;
  }

  async verifyEmail(data: {
    token: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  }

  async resendVerification(data: {
    email: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/resend-verification', data);
    return response.data;
  }
}
