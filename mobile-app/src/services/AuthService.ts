/**
 * AuthService - Authentication Service
 * Mengelola autentikasi pengguna dengan database lokal
 */

import DatabaseService, { User } from './DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: 'user' | 'admin' | 'super_user';
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  medicalHistory?: {
    parentHeight: number;
    parentWeight: number;
    chronicDiseases: string[];
    geneticConditions: string[];
    allergies: string[];
  };
}

class AuthService {
  private static instance: AuthService;
  private readonly REMEMBER_ME_KEY = '@babygrow/remember_me';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign Up - Registrasi user baru
   */
  async signUp(data: RegisterData): Promise<User> {
    try {
      // Validasi input
      this.validateEmail(data.email);
      this.validatePassword(data.password);
      this.validatePhone(data.phone);

      // Register ke database
      const newUser = await DatabaseService.registerUser({
        ...data,
        role: data.role || 'user',
      });

      console.log('✅ Sign Up berhasil:', newUser.email);
      return newUser;
    } catch (error) {
      console.error('❌ Sign Up error:', error);
      throw error;
    }
  }

  /**
   * Sign In - Login user
   */
  async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      // Validasi input
      this.validateEmail(credentials.email);
      
      if (!credentials.password) {
        throw new Error('Password harus diisi');
      }

      // Login
      const user = await DatabaseService.loginUser(
        credentials.email,
        credentials.password
      );

      // Simpan remember me
      if (credentials.rememberMe) {
        await AsyncStorage.setItem(
          this.REMEMBER_ME_KEY,
          JSON.stringify({ email: credentials.email })
        );
      } else {
        await AsyncStorage.removeItem(this.REMEMBER_ME_KEY);
      }

      console.log('✅ Sign In berhasil:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Sign In error:', error);
      throw error;
    }
  }

  /**
   * Login - Alias for signIn
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const user = await this.signIn({ email, password, rememberMe });
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login gagal'
      };
    }
  }

  /**
   * Sign Out - Logout user
   */
  async signOut(): Promise<void> {
    try {
      await DatabaseService.logoutUser();
      console.log('✅ Sign Out berhasil');
    } catch (error) {
      console.error('❌ Sign Out error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await DatabaseService.getCurrentUser();
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get remembered email for login
   */
  async getRememberedEmail(): Promise<string | null> {
    try {
      const rememberMeJson = await AsyncStorage.getItem(this.REMEMBER_ME_KEY);
      if (rememberMeJson) {
        const data = JSON.parse(rememberMeJson);
        return data.email;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updatedUser = await DatabaseService.updateUser(userId, updates);
      console.log('✅ Profile updated:', updatedUser.email);
      return updatedUser;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await DatabaseService.getCurrentUser();
      
      if (!user || user.id !== userId) {
        throw new Error('User tidak ditemukan');
      }

      if (user.password !== oldPassword) {
        throw new Error('Password lama salah');
      }

      this.validatePassword(newPassword);

      await DatabaseService.updateUser(userId, { password: newPassword });
      console.log('✅ Password berhasil diubah');
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  // ==================== VALIDATION ====================

  private validateEmail(email: string): void {
    if (!email) {
      throw new Error('Email harus diisi');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email tidak valid');
    }
  }

  private validatePassword(password: string): void {
    if (!password) {
      throw new Error('Password harus diisi');
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }
  }

  private validatePhone(phone: string): void {
    if (!phone) {
      throw new Error('Nomor telepon harus diisi');
    }

    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
      throw new Error('Format nomor telepon tidak valid');
    }
  }

  // ==================== DUMMY DATA ACCESS ====================

  /**
   * Get dummy accounts untuk testing
   */
  async getDummyAccounts(): Promise<{ email: string; password: string; role: string }[]> {
    return [
      { email: 'user@babygrow.app', password: 'user123', role: 'User' },
      { email: 'admin@babygrow.app', password: 'admin123', role: 'Admin' },
      { email: 'superuser@babygrow.app', password: 'super123', role: 'Super User' },
    ];
  }
}

export default AuthService.getInstance();
