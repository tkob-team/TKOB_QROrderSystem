// Auth data layer types

import { ApiResponse } from '@/types';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface IAuthStrategy {
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
