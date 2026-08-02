/**
 * Unauthorized — akun belum siap dipakai
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Button } from '../components/common/Button';
import { useAuthActions } from '../store/authStore';
import HapticService from '../services/HapticService';

export default function UnauthorizedScreen() {
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await HapticService.warning();
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Akses Belum Siap</Text>
      <Text style={styles.body}>
        Akun Anda belum dapat membuka aplikasi. Hubungi petugas atau admin
        fasilitas kesehatan agar akun disetel sebagai orang tua atau petugas.
      </Text>
      <Button title="Keluar" onPress={handleLogout} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: spacing.containerPadding,
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  btn: {
    borderRadius: borderRadius.full,
  },
});
