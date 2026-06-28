/**
 * Login Screen - VIBRANT PINK & ELEGANT WHITE Design
 * Filosofi: Background pink cerah, elegant white cards, premium typography
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';
import { useAuthActions } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

// Developer Footer Component
const DeveloperFooter = () => (
  <View style={styles.uigmFooter}>
    <Text style={styles.uigmTitle}>🎓 Developed by</Text>
    <Text style={styles.uigmAuthor}>Jemi Altio</Text>
    <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
    <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
    <Text style={styles.uigmYear}>© 2026</Text>
  </View>
);

export default function LoginScreen({ navigation }: any) {
  const { notification, showError, showSuccess, hideNotification } = useNotification();
  const { login } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const remembered = await AsyncStorage.getItem('@babygrow/remember_me');
      if (remembered) {
        const data = JSON.parse(remembered);
        setEmail(data.email || '');
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading remembered email:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Validasi', 'Email dan password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      // Login using authStore
      await login({ email, password });

      // Save remember me preference
      if (rememberMe) {
        await AsyncStorage.setItem(
          '@babygrow/remember_me',
          JSON.stringify({ email })
        );
      } else {
        await AsyncStorage.removeItem('@babygrow/remember_me');
      }

      showSuccess('Berhasil', 'Login berhasil! Selamat datang di BabyGrow 💗');
      // Navigation handled automatically by AppNavigatorRBAC
    } catch (error: any) {
      console.error('Login error:', error);
      showError('Login Gagal', error.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setTimeout(() => {
      handleLogin();
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background */}
      <View style={styles.background} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo & Title */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image 
                    source={require('../../assets/images/logo-babygrow.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.logoBadge}>
                  <Text style={styles.badgeText}>AI</Text>
                </View>
              </View>
              <Text style={styles.title}>BabyGrow</Text>
              <Text style={styles.subtitle}>
                Kawal Tumbuh Kembang Sejak Dini
              </Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>
              
              {/* Demo Credentials Hint */}
              <View style={styles.credentialHint}>
                <Text style={styles.hintText}>💡 Demo: parent@test.com / parent123</Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={colors.text.secondary}
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
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.secondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me */}
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Ingat saya</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.onWhite} />
                ) : (
                  <Text style={styles.loginButtonText}>Masuk</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Quick Login (for testing) */}
              <View style={styles.quickLogin}>
                <Text style={styles.quickLoginTitle}>Login Cepat (Demo):</Text>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickLogin('parent@test.com', 'parent123')}
                >
                  <Text style={styles.quickButtonText}>👤 Parent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickLogin('admin@puskesmas.id', 'admin123')}
                >
                  <Text style={styles.quickButtonText}>👨‍⚕️ Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Belum punya akun?{' '}
                <Text style={styles.footerLink}>Daftar di sini</Text>
              </Text>

              {/* UIGM Footer */}
              <View style={styles.uigmFooter}>
                <Text style={styles.uigmTitle}>🎓 Developed by</Text>
                <Text style={styles.uigmAuthor}>Jemi Altio</Text>
                <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
                <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
                <Text style={styles.uigmYear}>© 2026</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Custom notification */}
      <CustomNotification
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.lighter,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary.lighter,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.pink,
    borderWidth: 4,
    borderColor: colors.primary.vibrant,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoEmoji: {
    fontSize: 60,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary.vibrant,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.cardElevated,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  title: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.vibrant,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Card
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.standard,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // Credential Hint
  credentialHint: {
    backgroundColor: '#FFF9E6',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB800',
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: '#8B7000',
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  // Input
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.input,
    paddingHorizontal: spacing.md,
    height: 56,
    ...shadows.soft,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.regular,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 20,
  },

  // Remember Me
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary.vibrant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.vibrant,
  },
  checkmark: {
    color: colors.text.onWhite,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  rememberText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.regular,
  },

  // Login Button
  loginButton: {
    backgroundColor: colors.primary.vibrant,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 56,
    ...shadows.pink,
  },
  loginButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
  loginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.onWhite,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },

  // Quick Login
  quickLogin: {
    alignItems: 'center',
  },
  quickLoginTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  quickButton: {
    backgroundColor: colors.primary.lighter,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    minWidth: 200,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary.vibrant,
    fontWeight: typography.fontWeight.medium,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  footerLink: {
    color: colors.primary.vibrant,
    fontWeight: typography.fontWeight.semiBold,
  },
  // UIGM Footer Styles
  uigmFooter: {
    backgroundColor: colors.primary.light,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    width: '100%',
  },
  uigmTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  uigmAuthor: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  uigmDepartment: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  uigmUniversity: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uigmYear: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
});
