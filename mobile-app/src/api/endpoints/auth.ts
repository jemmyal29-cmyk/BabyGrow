/**
 * Authentication API Endpoints
 */

import apiClient from '../config';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  User,
  ApiResponse,
} from '../types/models';

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{
    user: User;
    tokens: AuthTokens;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      user: User;
      tokens: AuthTokens;
    }>>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<ApiResponse<{
    user: User;
    tokens: AuthTokens;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      user: User;
      tokens: AuthTokens;
    }>>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: async (idToken: string): Promise<ApiResponse<{
    user: User;
    tokens: AuthTokens;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      user: User;
      tokens: AuthTokens;
    }>>('/auth/google', { idToken });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default authApi;
