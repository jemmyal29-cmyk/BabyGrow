/**
 * MeasurementScreen — Live MQTT weight/height from HiveMQ (via useBabyGrowMQTT)
 * Example UI: big live numbers + connection indicator (green/red).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common';
import { useBabyGrowMQTT } from '../hooks/useBabyGrowMQTT';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface MeasurementScreenProps {
  navigation: { goBack: () => void };
}

function formatLive(value: number, digits = 1): string {
  if (!value || value <= 0) return '—';
  return value.toFixed(digits);
}

export default function MeasurementScreen({ navigation }: MeasurementScreenProps) {
  const {
    connectionStatus,
    liveWeight,
    liveHeight,
    deviceId,
    topic,
    isOnline,
    connect,
    triggerMockMeasurement,
  } = useBabyGrowMQTT({ autoConnect: true });

  const statusColor = isOnline
    ? colors.status.success
    : connectionStatus === 'Connecting'
      ? colors.status.warning
      : colors.status.error;

  const statusLabel =
    connectionStatus === 'Connected'
      ? 'Online'
      : connectionStatus === 'Connecting'
        ? 'Menyambung…'
        : 'Offline';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Ukur Live (MQTT)" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.meta}>
            {connectionStatus} · topic `{topic}`
          </Text>
          {deviceId ? (
            <Text style={styles.meta}>Perangkat: {deviceId}</Text>
          ) : (
            <Text style={styles.meta}>Menunggu data ESP32…</Text>
          )}
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Berat</Text>
            <Text style={styles.metricValue}>{formatLive(liveWeight)}</Text>
            <Text style={styles.metricUnit}>kg</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Tinggi</Text>
            <Text style={styles.metricValue}>{formatLive(liveHeight)}</Text>
            <Text style={styles.metricUnit}>cm</Text>
          </View>
        </View>

        <Text style={styles.hint}>
          Data masuk otomatis dari HiveMQ WebSocket. Jika sinyal Posyandu putus,
          aplikasi menyambung ulang di latar tanpa alert.
        </Text>

        {!isOnline ? (
          <TouchableOpacity style={styles.retryBtn} onPress={() => void connect()}>
            <MaterialCommunityIcons
              name="access-point-network"
              size={20}
              color={colors.text.inverse}
            />
            <Text style={styles.retryText}>Coba sambungkan</Text>
          </TouchableOpacity>
        ) : null}

        {__DEV__ ? (
          <TouchableOpacity
            style={styles.mockBtn}
            onPress={triggerMockMeasurement}
          >
            <Text style={styles.mockText}>[DEV] Simulasi pengukuran</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  statusCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  meta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.diffusion,
  },
  metricLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 56,
    lineHeight: 64,
    color: colors.primary.main,
  },
  metricUnit: {
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  hint: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
  },
  retryText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.text.inverse,
  },
  mockBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  mockText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
