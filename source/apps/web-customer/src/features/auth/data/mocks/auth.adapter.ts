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
}
