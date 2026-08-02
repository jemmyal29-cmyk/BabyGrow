/**
 * Register — daftar akun orang tua (ROLE_USER)
 * Visual: Create Account (desainuiux.md)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotification } from '../hooks/useNotification';
import CustomNotification from '../components/common/CustomNotification';
import { Button, Input, Card, ScreenHeader } from '../components/common';
import { useAuthActions } from '../store/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const { notification, showError, showSuccess, hideNotification } =
    useNotification();
  const { register } = useAuthActions();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      const msg = 'Nama, email, dan password wajib diisi';
      showError('Validasi', msg);
      Alert.alert('Validasi', msg);
      return;
    }
    if (password.length < 8) {
      const msg = 'Password minimal 8 karakter';
      showError('Validasi', msg);
      Alert.alert('Validasi', msg);
      return;
    }
    if (password !== confirm) {
      const msg = 'Konfirmasi password tidak cocok';
      showError('Validasi', msg);
      Alert.alert('Validasi', msg);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      if (result.needsEmailConfirmation) {
        Alert.alert(
          'Cek Email',
          'Akun dibuat. Jika diminta, konfirmasi email dulu lalu masuk.',
          [{ text: 'Ke Login', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        showSuccess('Berhasil', 'Akun siap. Selamat datang di BabyGrow!');
      }
    } catch (error: any) {
      const msg = error?.message || 'Gagal mendaftar';
      showError('Registrasi Gagal', msg);
      Alert.alert('Registrasi Gagal', msg);
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
        <ScreenHeader
          title="BabyGrow"
          brand
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.headline}>Create Account</Text>
            <Text style={styles.support}>
              Daftar sebagai orang tua untuk memantau pertumbuhan balita.
            </Text>
          </View>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Input
              label="Nama lengkap"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nama Anda"
              autoCapitalize="words"
              required
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              required
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.primary.main}
                  />
                </TouchableOpacity>
              }
            />
            <Input
              label="Konfirmasi password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Ulangi password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              required
            />
            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={isLoading}
              size="large"
            />
          </Card>

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <MaterialCommunityIcons
                name="shield-check"
                size={22}
                color={colors.primary.main}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Enterprise Encryption</Text>
              <Text style={styles.securityBody}>
                Data Anda diamankan dengan protokol modern.
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switch}>
              Sudah punya akun? <Text style={styles.switchBold}>Login</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Guide')}>
            <Text style={styles.guideLink}>Baca panduan aplikasi</Text>
          </TouchableOpacity>

          <Text style={styles.footerCredit}>Created by Tio 2026</Text>
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
  container: { flex: 1, backgroundColor: colors.background.default },
  safe: { flex: 1 },
  blobTop: {
    position: 'absolute',
    top: '25%',
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(182, 0, 89, 0.05)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: '20%',
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(182, 0, 89, 0.05)',
  },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  hero: { marginBottom: spacing.section },
  headline: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  support: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    opacity: 0.85,
  },
  formCard: { marginBottom: spacing.lg },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.diffusion,
  },
  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(182, 0, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
  },
  securityBody: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  switch: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  switchBold: {
    color: colors.primary.main,
    fontFamily: typography.fontFamily.bold,
  },
  guideLink: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
    textAlign: 'center',
  },
  footerCredit: {
    marginTop: spacing.section,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
