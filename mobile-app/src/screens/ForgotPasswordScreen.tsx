/**
 * Forgot Password — kirim link reset via Supabase Auth email
 * Visual: Reset Password (desainuiux.md)
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

export default function ForgotPasswordScreen({ navigation, route }: any) {
  const initialEmail = route?.params?.email ?? '';
  const { notification, showError, showSuccess, hideNotification } =
    useNotification();
  const { requestPasswordReset } = useAuthActions();
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      const msg = 'Masukkan email yang valid';
      showError('Validasi', msg);
      Alert.alert('Validasi', msg);
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(trimmed);
      setSent(true);
      showSuccess(
        'Email terkirim',
        'Cek inbox untuk tautan reset password. Periksa juga folder spam.'
      );
      Alert.alert(
        'Email terkirim',
        'Kami mengirim tautan reset password ke email Anda. Cek inbox (dan spam).',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const msg = error?.message || 'Gagal mengirim email reset';
      showError('Gagal', msg);
      Alert.alert('Gagal', msg);
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
        <ScreenHeader onBack={() => navigation.goBack()} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.headline}>Reset Password</Text>
            <Text style={styles.support}>
              Masukkan email akun Anda. Kami kirim tautan untuk membuat password
              baru.
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
              textContentType="emailAddress"
              required
            />
            <Button
              title={sent ? 'Kirim ulang' : 'Kirim tautan reset'}
              onPress={handleSubmit}
              loading={isLoading}
              size="large"
            />
          </Card>

          {sent ? (
            <View style={styles.hintCard}>
              <MaterialCommunityIcons
                name="email-check-outline"
                size={22}
                color={colors.primary.main}
              />
              <Text style={styles.hint}>
                Sudah dapat email? Buka tautannya, lalu kembali ke Login dengan
                password baru.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switch}>
              Ingat password? <Text style={styles.switchBold}>Login</Text>
            </Text>
          </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: colors.background.default },
  safe: { flex: 1 },
  blobTop: {
    position: 'absolute',
    top: '20%',
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
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  hero: { marginBottom: spacing.section },
  headline: {
    ...typography.styles.displayLg,
    fontSize: 36,
    lineHeight: 44,
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  support: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    opacity: 0.85,
    maxWidth: '90%',
  },
  formCard: { marginBottom: spacing.md },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.diffusion,
  },
  hint: {
    flex: 1,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  switch: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  switchBold: {
    color: colors.primary.main,
    fontFamily: typography.fontFamily.bold,
  },
  footer: {
    marginTop: spacing.section,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
