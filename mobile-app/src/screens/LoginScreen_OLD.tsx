/**
 * Login Screen - WARM & PROFESSIONAL CARE Design
 * Filosofi: Latar belakang pink lembut (#FADADD), card putih dengan shadow halus,
 * tombol rounded dengan pink lebih gelap (#FFB6C1)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/AuthService';
import DatabaseService from '../services/DatabaseService';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const rememberedEmail = await AuthService.getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading remembered email:', error);
    }
  };

  const handleLogin = async () => {
    // Validasi input kosong
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      // Login menggunakan AuthService
      const user = await AuthService.signIn({
        email,
        password,
        rememberMe,
      });

      // Login berhasil
      setIsLoading(false);

      // Check if user has children data
      const children = await DatabaseService.getChildrenByUserId(user.id);
      
      if (children.length > 0) {
        // User sudah lengkapi data, langsung ke MainTabs
        Alert.alert(
          'Login Berhasil',
          `Selamat datang kembali ${user.fullName}!\nRole: ${getRoleLabel(user.role)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.replace('MainTabs', { 
                  userRole: user.role,
                  userName: user.fullName 
                });
              },
            },
          ]
        );
      } else {
        // User baru, arahkan ke flow registrasi
        Alert.alert(
          'Selamat Datang! 👋',
          `Halo ${user.fullName}!\n\nUntuk memulai, mari lengkapi data anak terlebih dahulu.\n\nLangkah:\n1️⃣ Data Orang Tua (sudah selesai)\n2️⃣ Data Anak\n3️⃣ Hubungkan Alat IoT (opsional)`,
          [
            {
              text: 'Mulai Lengkapi Data',
              onPress: () => {
                navigation.replace('ParentData');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Login Gagal',
        error.message || 'Terjadi kesalahan saat login.\n\nDemo credentials:\nUser: user@babygrow.app / user123\nAdmin: admin@babygrow.app / admin123\nSuper: superuser@babygrow.app / super123'
      );
    }
  };

  const handleQuickFill = async (role: 'user' | 'admin' | 'super_user') => {
    const dummyAccounts = await AuthService.getDummyAccounts();
    const account = dummyAccounts.find(acc => acc.role.toLowerCase().replace(' ', '_') === role);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'user':
        return 'Pengguna';
      case 'admin':
        return 'Admin (Bidan/Petugas)';
      case 'super_user':
        return 'Super User (Pemilik Sistem)';
      default:
        return 'Pengguna';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo BabyGrow */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⚖️</Text>
          </View>
          <Text style={styles.appName}>BabyGrow</Text>
          <Text style={styles.appTagline}>
            Pantau Pertumbuhan Buah Hati dengan AI
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Selamat Datang</Text>
          <Text style={styles.formSubtitle}>
            Silakan login untuk melanjutkan
          </Text>

          {/* Quick Login Card */}
          {rememberMe && email && (
            <View style={styles.quickLoginCard}>
              <View style={styles.quickLoginHeader}>
                <Text style={styles.quickLoginTitle}>💾 Email Tersimpan</Text>
              </View>
              <Text style={styles.quickLoginEmail}>{email}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="user@babygrow.app"
                placeholderTextColor={colors.neutral.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.neutral.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Selector - REMOVED, auto-detect from database */}

          {/* Quick Fill Buttons */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quick Fill (Testing)</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.quickFillButton, { backgroundColor: '#E3F2FD' }]}
                onPress={() => handleQuickFill('user')}
              >
                <Text style={styles.quickFillText}>👤 User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickFillButton, { backgroundColor: '#F3E5F5' }]}
                onPress={() => handleQuickFill('admin')}
              >
                <Text style={styles.quickFillText}>👩‍⚕️ Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickFillButton, { backgroundColor: '#FFF3E0' }]}
                onPress={() => handleQuickFill('super_user')}
              >
                <Text style={styles.quickFillText}>🔧 Super</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me Checkbox */}
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[
              styles.checkbox,
              rememberMe && styles.checkboxChecked
            ]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>
              Ingat Saya (Simpan email dan password)
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          {/* Demo Info */}
          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>🧪 Demo Mode</Text>
            <Text style={styles.demoText}>
              User: user@babygrow.app / user123{'\n'}
              Admin: admin@babygrow.app / admin123{'\n'}
              Super: super@babygrow.app / super123
            </Text>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Lupa Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔐</Text>
          <Text style={styles.securityText}>
            Data Anda dienkripsi end-to-end dan tersimpan aman sesuai ISO 27001
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          BabyGrow v1.0.0 • © 2026{'\n'}
          Powered by AI & WHO Standards
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default, // #FADADD - Soft Pastel Pink
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.light, // #FFE4E9 - Very Light Pink
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.background.paper, // White border
  },
  logoIcon: {
    fontSize: 56,
  },
  appName: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.primary.dark, // #FFB6C1 - Medium Pink
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  appTagline: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.md,
  },
  formCard: {
    backgroundColor: colors.background.paper, // White card
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: colors.neutral.gray800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper, // White background
    borderRadius: borderRadius.md, // More rounded
    borderWidth: 2,
    borderColor: colors.border.input, // #FFD1DC - Light pink border
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inputIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.regular,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  eyeIcon: {
    fontSize: 24,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.paper,
  },
  roleOptionActive: {
    borderColor: colors.primary.main,
    backgroundColor: '#FFF0F5',
  },
  roleRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral.gray400,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  roleTextActive: {
    color: colors.primary.main,
  },
  roleDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    lineHeight: 16,
  },
  quickFillButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md, // Rounded
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.light,
    backgroundColor: colors.background.paper,
  },
  quickFillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  loginButton: {
    backgroundColor: colors.primary.dark, // #FFB6C1 - Darker pink button
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md, // Maximum rounded
    alignItems: 'center',
    marginTop: spacing.lg,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: colors.neutral.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.paper, // White text
    letterSpacing: typography.letterSpacing.wide,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.input,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.dark, // #FFB6C1
    borderColor: colors.primary.dark,
  },
  checkmark: {
    color: colors.background.paper, // White checkmark
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  rememberMeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    flex: 1,
  },
  quickLoginCard: {
    backgroundColor: colors.primary.light, // #FFE4E9 - Very light pink
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary.soft, // #FADADD
  },
  quickLoginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickLoginTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.dark,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  clearButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.status.error,
    fontWeight: typography.fontWeight.semiBold,
  },
  quickLoginEmail: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  quickLoginRole: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  quickLoginButton: {
    backgroundColor: colors.primary.dark,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickLoginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.paper,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.divider,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  demoInfo: {
    backgroundColor: colors.primary.light, // #FFE4E9
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.soft,
  },
  demoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  demoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  forgotText: {
    fontSize: typography.fontSize.md,
    color: colors.primary.dark,
    fontWeight: typography.fontWeight.semiBold,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper, // White card
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary.light,
    shadowColor: colors.neutral.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  securityIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});
