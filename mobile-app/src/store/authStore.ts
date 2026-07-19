/**
 * Auth Store — Supabase Session + RBAC
 * Relational profile data lives in Supabase `profiles` table.
 */

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/SupabaseClient';
import type { AuthUser, LoginCredentials, UserRole } from '../types/auth';
import type { ProfileRow } from '../types/database';

interface AuthStoreState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  clearError: () => void;
}

function mapProfileToAuthUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role,
    avatar: profile.avatar_url ?? undefined,
    phone: profile.phone ?? undefined,
    location: {
      puskesmas: profile.puskesmas ?? undefined,
      district: profile.district ?? undefined,
      city: profile.city ?? undefined,
    },
  };
}

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('[Auth] fetchProfile error:', error?.message);
    return null;
  }

  return mapProfileToAuthUser(data as ProfileRow);
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({
          session,
          user: profile,
          isAuthenticated: !!profile,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }

      supabase.auth.onAuthStateChange(async (event, nextSession) => {
        if (event === 'SIGNED_OUT' || !nextSession?.user) {
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          const profile = await fetchProfile(nextSession.user.id);
          set({
            session: nextSession,
            user: profile,
            isAuthenticated: !!profile,
            isLoading: false,
          });
        }
      });
    } catch (error) {
      console.error('[Auth] initialize error:', error);
      set({
        isLoading: false,
        isInitialized: true,
        error: error instanceof Error ? error.message : 'Gagal inisialisasi auth',
      });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message === 'Invalid login credentials'
          ? 'Email atau password salah'
          : error.message);
      }

      if (!data.session?.user) {
        throw new Error('Login gagal: sesi tidak tersedia');
      }

      const profile = await fetchProfile(data.session.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Profil pengguna tidak ditemukan. Hubungi admin.');
      }

      set({
        session: data.session,
        user: profile,
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
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } finally {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  updateUser: (userData: Partial<AuthUser>) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...userData } });
    }
  },

  clearError: () => set({ error: null }),
}));

export const useAuth = () =>
  useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
  }));

export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    initialize: state.initialize,
    updateUser: state.updateUser,
    clearError: state.clearError,
  }));

export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === ('ROLE_ADMIN' as UserRole));
export const useIsUser = () =>
  useAuthStore((state) => state.user?.role === ('ROLE_USER' as UserRole));
