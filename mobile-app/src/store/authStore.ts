/**
 * Auth Store with RBAC - Zero Dependencies Implementation
 * Zustand + Persist for secure authentication
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser, LoginCredentials, AuthState, AuthActions } from '../types/auth';

// Mock Authentication Service (Replace with real API)
const mockAuthenticate = async (credentials: LoginCredentials): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock Users Database
  const mockUsers: Record<string, { password: string; user: AuthUser }> = {
    'parent@test.com': {
      password: 'parent123',
      user: {
        id: 'user_001',
        email: 'parent@test.com',
        name: 'Ibu Sari',
        role: 'ROLE_USER',
        avatar: '👩',
        phone: '+6281234567890',
      },
    },
    'admin@puskesmas.id': {
      password: 'admin123',
      user: {
        id: 'admin_001',
        email: 'admin@puskesmas.id',
        name: 'Dr. Budi Santoso',
        role: 'ROLE_ADMIN',
        avatar: '👨‍⚕️',
        phone: '+6287654321098',
        location: {
          puskesmas: 'Puskesmas Cipto',
          district: 'Menteng',
          city: 'Jakarta Pusat',
        },
      },
    },
  };

  const mockUser = mockUsers[credentials.email.toLowerCase()];

  if (!mockUser || mockUser.password !== credentials.password) {
    throw new Error('Email atau password salah');
  }

  return {
    user: mockUser.user,
    accessToken: `mock_access_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
  };
};

type AuthStoreState = AuthState & AuthActions;

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const { user, accessToken, refreshToken } = await mockAuthenticate(credentials);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login gagal',
          });
          throw error;
        }
      },

      logout: async () => {
        // Clear AsyncStorage
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'babygrow-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for easy access
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
  clearError: state.clearError,
}));

export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ROLE_ADMIN');
export const useIsUser = () => useAuthStore((state) => state.user?.role === 'ROLE_USER');
