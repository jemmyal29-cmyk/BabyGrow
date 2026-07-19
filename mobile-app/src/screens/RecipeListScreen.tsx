/**
 * Recipe List Screen — MBG recipes (wrapped as under construction in Phase 4)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button, UnderConstructionModal } from '../components/common';
import { colors, spacing, typography } from '../theme';

export default function RecipeListScreen({ navigation }: any) {
  const [showModal, setShowModal] = useState(true);

  return (
    <LinearGradient colors={[...colors.secondary.gradient.softBg]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Card variant="elevated" padding="large" style={styles.headerCard}>
              <Text style={styles.emoji}>🥘</Text>
              <Text style={styles.title}>Resep MBG</Text>
              <Text style={styles.subtitle}>
                Makanan Bergizi Gratis untuk nutrisi optimal anak
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Card variant="glass" padding="large">
              <Text style={styles.infoText}>Database Resep Sedang Dimuat</Text>
              <Text style={styles.infoDesc}>
                Smart MBG Engine akan merekomendasikan resep terbaik berdasarkan status
                gizi anak Anda.
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Button
              title="Kembali"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="large"
              fullWidth
            />
          </Animated.View>
        </ScrollView>

        <UnderConstructionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          featureName="Resep MBG"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerCard: { alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.status.success,
    marginBottom: spacing.sm,
  },
  infoDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});
