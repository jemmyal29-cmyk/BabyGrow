/**
 * Login Screen — desainuiux.md light professional
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';
import { Button, Input, Card, ScreenHeader } from '../components/common';
import { useAuthActions } from '../store/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const REMEMBER_KEY = '@babygrow/remember_email';

export default function LoginScreen() {
  const { notification, showError, showSuccess, hideNotification } = useNotification();
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
      showError('Validasi', 'Email dan password harus diisi');
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
      showError('Login Gagal', error?.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScreenHeader brand title="BabyGrow" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/images/logo-babygrow.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headline}>Monitor Baby's Growth</Text>
            <Text style={styles.support}>
              Kawal tumbuh kembang dengan presisi klinis dan integrasi IoT.
            </Text>
          </View>

          <Card variant="elevated" padding="large">
            <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              required
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Ingat saya</Text>
            </TouchableOpacity>

            <Button title="Masuk" onPress={handleLogin} loading={isLoading} size="large" />
          </Card>

          <Text style={styles.footer}>© 2026 BabyGrow · Universitas Indo Global Mandiri</Text>
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
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.section,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.section,
    marginTop: spacing.md,
  },
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.diffusion,
    borderWidth: 3,
    borderColor: colors.primary.fixedDim,
  },
  logoImage: { width: 88, height: 88 },
  headline: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  support: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  cardTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  rememberText: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: spacing.section,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
