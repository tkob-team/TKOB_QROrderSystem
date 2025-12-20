// Auth service - handles authentication and user profile

import { USE_MOCK_API } from '@/lib/constants';
import { authHandlers } from '@/api/mocks';
import apiClient from '@/api/client';
import { ApiResponse } from '@/types';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export const AuthService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (USE_MOCK_API) {
      return authHandlers.getCurrentUser();
    }
    
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
  
  /**
   * Update user profile
   */
  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    if (USE_MOCK_API) {
      return authHandlers.updateProfile(data);
    }
    
    const response = await apiClient.put('/api/auth/profile', data);
    return response.data;
  },
  
  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_API) {
      return authHandlers.changePassword(data);
    }
    
    const response = await apiClient.post('/api/auth/change-password', data);
    return response.data;
  },
  
  /**
   * Login
   */
  async login(data: { 
    email: string; 
    password: string; 
  }): Promise<ApiResponse<User>> {
    if (USE_MOCK_API) {
      return authHandlers.login(data);
    }
    
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },
  
  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    if (USE_MOCK_API) {
      return authHandlers.logout();
    }
    
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
};
