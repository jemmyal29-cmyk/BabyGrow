/**
 * MeasurementScreen — Live MQTT weight/height from HiveMQ (via useBabyGrowMQTT)
 * Starts MeasurementSync so E2E persist works even without visiting Beranda first.
 */

import React, { useEffect, useState } from 'react';
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
import MeasurementSyncService from '../services/MeasurementSyncService';
import { useChildStore } from '../store/childStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface MeasurementScreenProps {
  navigation: { goBack: () => void; navigate: (name: string) => void };
}

function formatLive(value: number, digits = 1): string {
  if (!value || value <= 0) return '—';
  return value.toFixed(digits);
}

const MOCK_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ALLOW_MOCK?.trim() === '1';

/** Human "X detik/menit lalu" from a device last-seen ISO timestamp. */
function formatLastSeen(iso: string | null, nowMs: number): string {
  if (!iso) return 'Belum ada data';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Belum ada data';
  const diffSec = Math.max(0, Math.round((nowMs - t) / 1000));
  if (diffSec < 2) return 'Baru saja';
  if (diffSec < 60) return `Terakhir kirim ${diffSec} detik lalu`;
  const min = Math.floor(diffSec / 60);
  return `Terakhir kirim ${min} menit lalu`;
}

export default function MeasurementScreen({ navigation }: MeasurementScreenProps) {
  const activeChild = useChildStore((s) => s.activeChild);
  const {
    connectionStatus,
    liveWeight,
    liveHeight,
    deviceId,
    lastUpdatedAt,
    topic,
    isOnline,
    connect,
    triggerMockMeasurement,
  } = useBabyGrowMQTT({ autoConnect: true });

  // E2E: persist MQTT → Z-score even if user skip Beranda
  useEffect(() => {
    MeasurementSyncService.getInstance().start();
  }, []);

  // Re-render every second so the device "last seen" clock stays fresh.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Broker (HiveMQ WebSocket) — separate from whether the physical device sends data.
  const brokerColor = isOnline
    ? colors.status.success
    : connectionStatus === 'Connecting'
      ? colors.status.warning
      : colors.status.error;
  const brokerLabel =
    connectionStatus === 'Connected'
      ? 'Broker: Terhubung'
      : connectionStatus === 'Connecting'
        ? 'Broker: Menyambung…'
        : 'Broker: Terputus';

  // Device liveness — "fresh" if a measurement arrived within the last 15s.
  const deviceAgeSec = lastUpdatedAt
    ? (nowMs - new Date(lastUpdatedAt).getTime()) / 1000
    : Infinity;
  const deviceFresh = Number.isFinite(deviceAgeSec) && deviceAgeSec <= 15;
  const deviceColor = deviceFresh
    ? colors.status.success
    : lastUpdatedAt
      ? colors.status.warning
      : colors.status.error;
  const deviceLabel = `Alat: ${formatLastSeen(lastUpdatedAt, nowMs)}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Ukur Live (MQTT)" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: brokerColor }]} />
            <Text style={[styles.statusText, { color: brokerColor }]}>
              {brokerLabel}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: deviceColor }]} />
            <Text style={[styles.statusText, { color: deviceColor }]}>
              {deviceLabel}
            </Text>
          </View>
          <Text style={styles.meta}>topic `{topic}`</Text>
          {deviceId ? (
            <Text style={styles.meta}>Perangkat: {deviceId}</Text>
          ) : (
            <Text style={styles.meta}>Menunggu data ESP32…</Text>
          )}
          {activeChild ? (
            <Text style={styles.childLine}>
              Anak aktif: {activeChild.name} — data stabil akan disimpan otomatis
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.warnBox}
              onPress={() => navigation.navigate('Children')}
            >
              <Text style={styles.warnText}>
                Belum ada anak aktif. Ketuk untuk pilih anak — tanpa ini angka
                live tampil tapi tidak tersimpan ke grafik/AI.
              </Text>
            </TouchableOpacity>
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
          Data masuk otomatis dari HiveMQ WebSocket. Tahan beban/tinggi stabil
          ~1–2 detik agar firmware + app mengunci sampel lalu simpan.
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

        {MOCK_ENABLED ? (
          <TouchableOpacity
            style={styles.mockBtn}
            onPress={triggerMockMeasurement}
          >
            <Text style={styles.mockText}>
              {__DEV__ ? '[DEV] Simulasi pengukuran' : 'Simulasi pengukuran (fallback)'}
            </Text>
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
  childLine: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
  },
  warnBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.status.errorContainer,
  },
  warnText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
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
    fontSize: typography.fontSize.xxxl,
    color: colors.text.onSurface,
  },
  metricUnit: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
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
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
  },
  retryText: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  mockBtn: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.divider,
  },
  mockText: {
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
});
