// Mock handlers for auth-related API calls

import { ApiResponse } from '@/types';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Mock user data
let mockUser: User | null = null;

export const authHandlers = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(300);
    
    if (!mockUser) {
      return createErrorResponse('Not authenticated');
    }
    
    return createSuccessResponse(mockUser);
  },
  
  /**
   * Update user profile
   */
  async updateProfile(data: { name: string }): Promise<ApiResponse<User>> {
    await delay(500);
    
    if (!mockUser) {
      return createErrorResponse('Not authenticated');
    }
    
    mockUser = {
      ...mockUser,
      name: data.name,
    };
    
    return createSuccessResponse(mockUser);
  },
  
  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    
    if (!mockUser) {
      return createErrorResponse('Not authenticated');
    }
    
    // Mock validation
    if (data.currentPassword !== 'password123') {
      return createErrorResponse('Current password is incorrect');
    }
    
    if (data.newPassword.length < 8) {
      return createErrorResponse('New password must be at least 8 characters');
    }
    
    return createSuccessResponse({ 
      message: 'Password changed successfully' 
    });
  },
  
  /**
   * Login (mock)
   */
  async login(data: { email: string; password: string }): Promise<ApiResponse<User>> {
    await delay(800);
    
    // Mock successful login
    mockUser = {
      id: 'user-1',
      email: data.email,
      name: 'John Doe',
      avatar: undefined,
    };
    
    return createSuccessResponse(mockUser);
  },
  
  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    await delay(300);
    
    mockUser = null;
    
    return createSuccessResponse({ 
      message: 'Logged out successfully' 
    });
  },
};
