/**
 * Auth Store — Supabase Session + RBAC
 * Relational profile data lives in Supabase `profiles` table.
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/SupabaseClient';
import type { AuthUser, LoginCredentials, UserRole } from '../types/auth';
import type { ProfileRow } from '../types/database';
import { ensureOwnProfile } from '../hooks/useChildren';

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResult {
  needsEmailConfirmation: boolean;
}

interface AuthStoreState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  requestPasswordReset: (email?: string) => Promise<void>;
  clearError: () => void;
}

let authListenerBound = false;

function mapProfileToAuthUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: resolveProfileRole(profile),
    avatar: profile.avatar_url ?? undefined,
    phone: profile.phone ?? undefined,
    location: {
      puskesmas: profile.puskesmas ?? undefined,
      district: profile.district ?? undefined,
      city: profile.city ?? undefined,
    },
  };
}

/** Prefer role_app (TEXT) over legacy enum `role` */
function resolveProfileRole(profile: ProfileRow): UserRole {
  const candidates = [profile.role_app, profile.role];
  for (const raw of candidates) {
    if (raw === 'ROLE_ADMIN' || raw === 'ROLE_USER') return raw;
    const t = String(raw ?? '').toLowerCase();
    if (['admin', 'role_admin', 'petugas', 'kader'].includes(t)) {
      return 'ROLE_ADMIN';
    }
    if (['user', 'role_user', 'parent', 'orang_tua'].includes(t)) {
      return 'ROLE_USER';
    }
  }
  return 'ROLE_USER';
}

function resolveMetaRole(raw: unknown): UserRole {
  if (raw === 'ROLE_ADMIN' || raw === 'ROLE_USER') return raw;
  const t = String(raw ?? '').toLowerCase();
  if (['admin', 'role_admin', 'petugas', 'kader'].includes(t)) return 'ROLE_ADMIN';
  return 'ROLE_USER';
}

/** Fallback jika query profiles gagal (race auth lock / RLS) */
function authUserFromAuthUser(user: User): AuthUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: user.id,
    email: user.email ?? '',
    name: String(meta.full_name ?? user.email?.split('@')[0] ?? 'User'),
    role: resolveMetaRole(meta.role),
  };
}

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    console.error('[Auth] fetchProfile error:', error?.message);
    return null;
  }

  const row = data as ProfileRow;
  if (!row.email) {
    const { data: sessionData } = await supabase.auth.getSession();
    row.email = sessionData.session?.user?.email ?? '';
  }

  return mapProfileToAuthUser(row);
}

async function fetchProfileWithRetry(
  userId: string,
  attempts = 3
): Promise<AuthUser | null> {
  for (let i = 0; i < attempts; i += 1) {
    const profile = await fetchProfile(userId);
    if (profile) return profile;
    // Backfill missing profiles row (FK parent_id) then retry
    if (i === 0) {
      try {
        await ensureOwnProfile(userId);
      } catch (err) {
        console.warn('[Auth] ensureOwnProfile failed:', err);
      }
    }
    await new Promise((r) => setTimeout(r, 250 * (i + 1)));
  }
  return null;
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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const profile =
          (await fetchProfileWithRetry(session.user.id)) ??
          authUserFromAuthUser(session.user);
        set({
          session,
          user: profile,
          isAuthenticated: true,
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

      if (!authListenerBound) {
        authListenerBound = true;
        supabase.auth.onAuthStateChange((event, nextSession) => {
          // Defer: hindari deadlock auth lock supabase-js di RN
          setTimeout(async () => {
            if (event === 'SIGNED_OUT' || !nextSession?.user) {
              set({
                session: null,
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
              return;
            }

            if (
              event === 'SIGNED_IN' ||
              event === 'TOKEN_REFRESHED' ||
              event === 'INITIAL_SESSION'
            ) {
              const profile = await fetchProfileWithRetry(nextSession.user.id);
              if (profile) {
                set({
                  session: nextSession,
                  user: profile,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }

              // Jangan tendang sesi yang sudah valid (race setelah login)
              const current = get();
              if (
                current.isAuthenticated &&
                current.user?.id === nextSession.user.id
              ) {
                set({ session: nextSession, isLoading: false });
                return;
              }

              set({
                session: nextSession,
                user: authUserFromAuthUser(nextSession.user),
                isAuthenticated: true,
                isLoading: false,
              });
            }
          }, 0);
        });
      }
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
        password: credentials.password.trim(),
      });

      if (error) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Email atau password salah'
            : error.message
        );
      }

      if (!data.session?.user) {
        throw new Error('Login gagal: sesi tidak tersedia');
      }

      const profile =
        (await fetchProfileWithRetry(data.session.user.id)) ??
        authUserFromAuthUser(data.session.user);

      if (profile.role !== 'ROLE_USER' && profile.role !== 'ROLE_ADMIN') {
        await supabase.auth.signOut();
        throw new Error('Role akun tidak valid. Hubungi administrator.');
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

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const email = credentials.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName.trim(),
            role: 'ROLE_USER',
          },
        },
      });

      if (error) {
        if (/already registered|already been registered/i.test(error.message)) {
          throw new Error('Email sudah terdaftar. Silakan login.');
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registrasi gagal. Coba lagi.');
      }

      // Session langsung tersedia (email confirm dimatikan di Supabase)
      if (data.session?.user) {
        const profile =
          (await fetchProfileWithRetry(data.session.user.id)) ??
          authUserFromAuthUser(data.session.user);
        set({
          session: data.session,
          user: profile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { needsEmailConfirmation: false };
      }

      set({ isLoading: false, error: null });
      return { needsEmailConfirmation: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registrasi gagal',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch {
      // Always clear local session even if network/signOut fails
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

  requestPasswordReset: async (emailArg?: string) => {
    const email = (emailArg ?? get().user?.email ?? '').trim().toLowerCase();
    if (!email) {
      throw new Error('Email tidak tersedia untuk reset password');
    }
    const redirectTo = 'babygrow://reset-password';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw new Error(error.message);
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
    register: state.register,
    logout: state.logout,
    initialize: state.initialize,
    updateUser: state.updateUser,
    requestPasswordReset: state.requestPasswordReset,
    clearError: state.clearError,
  }));

export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === ('ROLE_ADMIN' as UserRole));
export const useIsUser = () =>
  useAuthStore((state) => state.user?.role === ('ROLE_USER' as UserRole));

const VALID_ROLES: UserRole[] = ['ROLE_USER', 'ROLE_ADMIN'];

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRole);
}
