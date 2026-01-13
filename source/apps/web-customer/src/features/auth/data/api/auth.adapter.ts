// Real Auth Adapter for feature

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { IAuthAdapter, User } from '../adapter.interface';

export class AuthAdapter implements IAuthAdapter {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  }

  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/api/auth/profile', data);
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/api/auth/change-password', data);
    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  }
}
