// Auth feature data adapter interface

import { ApiResponse } from '@/types';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Contract for auth data adapters
 * 
 * Defines all methods for authentication operations (login, profile, password change)
 * Implemented by real adapters (API calls) and mock adapters (MSW handlers)
 */
export interface IAuthAdapter {
  getCurrentUser(): Promise<ApiResponse<User>>;

  updateProfile(data: { name: string }): Promise<ApiResponse<User>>;

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>>;

  login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>>;

  logout(): Promise<ApiResponse<{ message: string }>>;
}
