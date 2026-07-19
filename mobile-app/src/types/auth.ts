/**
 * Auth types — RBAC
 */

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: {
    puskesmas?: string;
    district?: string;
    city?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}
