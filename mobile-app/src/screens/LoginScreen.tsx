/**
 * Login Screen — Welcome Back + Register + Lupa Password
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';
import { Button, Input, Card } from '../components/common';
import { useAuthActions } from '../store/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const REMEMBER_KEY = '@babygrow/remember_email';

export default function LoginScreen({ navigation }: any) {
  const { notification, showError, showSuccess, hideNotification } =
    useNotification();
  const { login } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const remembered = await AsyncStorage.getItem(REMEMBER_KEY);
        if (remembered) {
          setEmail(remembered);
          setRememberMe(true);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Email dan password harus diisi';
      showError('Validasi', msg);
      Alert.alert('Validasi', msg);
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_KEY, email.trim().toLowerCase());
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY);
      }
      showSuccess('Berhasil', 'Login berhasil! Selamat datang di BabyGrow');
    } catch (error: any) {
      const msg = error?.message || 'Email atau password salah';
      showError('Login Gagal', msg);
      Alert.alert('Login Gagal', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.blobTop} pointerEvents="none" />
      <View style={styles.blobBottom} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.brand}>BabyGrow</Text>

          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/images/logo-babygrow.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headline}>Welcome Back!</Text>
            <Text style={styles.support}>
              Login untuk memantau tumbuh kembang balita Anda.
            </Text>
          </View>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              importantForAutofill="yes"
              required
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="password"
              textContentType="password"
              importantForAutofill="yes"
              required
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.togglePassword}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              }
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                >
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberText}>Ingat saya</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ForgotPassword', {
                    email: email.trim(),
                  })
                }
                hitSlop={8}
              >
                <Text style={styles.forgot}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              size="large"
            />
          </Card>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switch}>
              Belum punya akun? <Text style={styles.switchBold}>Daftar</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Guide')}>
              <Text style={styles.guideLink}>Panduan</Text>
            </TouchableOpacity>
            <Text style={styles.linkDot}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Help')}>
              <Text style={styles.guideLink}>Bantuan / FAQ</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Created by Tio 2026</Text>
        </ScrollView>
      </SafeAreaView>

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
    backgroundColor: colors.background.default,
  },
  safe: { flex: 1 },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.overlay,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: borderRadius.full,
    backgroundColor: colors.effects.glassPink,
  },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.section,
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  brand: {
    ...typography.styles.brandMark,
    color: colors.primary.main,
    marginBottom: spacing.section,
  },
  hero: {
    marginBottom: spacing.section,
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.fixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.diffusion,
    borderWidth: 3,
    borderColor: colors.primary.fixedDim,
  },
  logoImage: { width: 104, height: 104 },
  headline: {
    ...typography.styles.displayLg,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  support: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    maxWidth: 320,
  },
  formCard: {
    borderRadius: borderRadius.xl,
  },
  togglePassword: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
    letterSpacing: 0,
    textTransform: 'none',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.DEFAULT,
    borderWidth: 2,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
  },
  checkmark: {
    color: colors.primary.onPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
  },
  rememberText: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  forgot: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
  switch: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  switchBold: {
    color: colors.primary.main,
    fontFamily: typography.fontFamily.bold,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  linkDot: {
    color: colors.text.disabled,
  },
  guideLink: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    marginTop: spacing.section,
    paddingTop: spacing.lg,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
