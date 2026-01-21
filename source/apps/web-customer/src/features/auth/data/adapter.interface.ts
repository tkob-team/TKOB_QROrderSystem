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

  updateProfile(data: { name: string; avatarFile?: File }): Promise<ApiResponse<User>>;

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>>;

  login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>>;

  logout(): Promise<ApiResponse<{ message: string }>>;
  
  // Registration & verification
  register(data: { 
    email: string; 
    password: string; 
    fullName?: string 
  }): Promise<ApiResponse<{ message: string }>>;
  
  verifyEmail(data: { 
    token: string 
  }): Promise<ApiResponse<{ message: string }>>;
  
  resendVerification(data: { 
    email: string 
  }): Promise<ApiResponse<{ message: string }>>;
  
  // Password reset
  requestPasswordReset(data: { 
    email: string 
  }): Promise<ApiResponse<{ message: string }>>;
  
  resetPassword(data: { 
    token: string; 
    password: string 
  }): Promise<ApiResponse<{ message: string }>>;
}
