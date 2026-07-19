/**
 * Live Measurement Card — MQTT live + Supabase realtime Z-Scores
 * States: no child → skeleton → live/DB data → empty measurement
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MQTTService from '../../services/MQTTService';
import type { MQTTMeasurement } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  useLatestMeasurement,
  getStuntingDisplay,
} from '../../hooks/useMeasurements';
import { useChildStore } from '../../store/childStore';
import { SkeletonLoader } from './SkeletonLoader';
import HapticService from '../../services/HapticService';

interface LiveMeasurementCardProps {
  height?: number;
  weight?: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  isConnected?: boolean;
  /** Subscribe to MQTT inside the card (default true) */
  bindMqtt?: boolean;
  childId?: string | null;
  onSelectChild?: () => void;
}

export function LiveMeasurementCard({
  height: heightProp = 0,
  weight: weightProp = 0,
  quality: qualityProp = 'good',
  isConnected: connectedProp = false,
  bindMqtt = true,
  childId: childIdProp,
  onSelectChild,
}: LiveMeasurementCardProps) {
  const storeChildId = useChildStore((s) => s.activeChildId);
  const childId = childIdProp !== undefined ? childIdProp : storeChildId;

  const {
    data: latestDb,
    isPending,
    isFetching,
    isError,
  } = useLatestMeasurement(childId);

  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [quality, setQuality] = useState(qualityProp);
  const [isConnected, setIsConnected] = useState(connectedProp);
  const [displayHeight, setDisplayHeight] = useState(0);
  const glowOpacity = useSharedValue(0);

  // Reset live buffer when active child changes (race-safe)
  useEffect(() => {
    setHeight(0);
    setWeight(0);
    setDisplayHeight(0);
    setQuality('good');
  }, [childId]);

  const onMqttMeasurement = useCallback((data: unknown) => {
    const m = data as MQTTMeasurement;
    setHeight(m.height_cm);
    setWeight(m.weight_kg || 0);
    setQuality(m.quality);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!bindMqtt) {
      setHeight(heightProp);
      setWeight(weightProp ?? 0);
      setQuality(qualityProp);
      setIsConnected(connectedProp);
      return;
    }

    const mqtt = MQTTService.getInstance();
    setIsConnected(mqtt.isConnected());

    const onConnected = () => setIsConnected(true);
    const onOffline = () => setIsConnected(false);

    mqtt.on('connected', onConnected);
    mqtt.on('offline', onOffline);
    mqtt.on('disconnected', onOffline);
    mqtt.on('measurement', onMqttMeasurement);

    return () => {
      mqtt.off('connected', onConnected);
      mqtt.off('offline', onOffline);
      mqtt.off('disconnected', onOffline);
      mqtt.off('measurement', onMqttMeasurement);
    };
  }, [bindMqtt, heightProp, weightProp, qualityProp, connectedProp, onMqttMeasurement]);

  const displayWeight = useMemo(() => {
    if (weight > 0) return weight;
    return latestDb?.weight_kg ?? 0;
  }, [weight, latestDb?.weight_kg]);

  const resolvedHeight = height > 0 ? height : Number(latestDb?.height_cm ?? 0);
  const hasLiveOrDb = resolvedHeight > 0;
  const showSkeleton =
    !!childId && isPending && !latestDb && height <= 0;

  useEffect(() => {
    if (resolvedHeight <= 0) {
      setDisplayHeight(0);
      return;
    }

    const interval = setInterval(() => {
      setDisplayHeight((prev) => {
        const diff = resolvedHeight - prev;
        if (Math.abs(diff) < 0.1) return resolvedHeight;
        return prev + diff * 0.15;
      });
    }, 50);

    glowOpacity.value = withTiming(1, { duration: 300 }, () => {
      glowOpacity.value = withTiming(0, { duration: 1000 });
    });

    return () => clearInterval(interval);
  }, [resolvedHeight, glowOpacity, latestDb?.id, childId]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const stunting = useMemo(
    () =>
      getStuntingDisplay({
        stunting_risk: latestDb?.stunting_risk,
        z_score_hfa: latestDb?.z_score_hfa,
        z_score_wfa: latestDb?.z_score_wfa,
      }),
    [latestDb]
  );

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return colors.status.success;
      case 'good':
        return colors.tertiary.fixedDim;
      case 'fair':
        return colors.status.warning;
      case 'poor':
        return colors.status.error;
      default:
        return colors.neutral.gray500;
    }
  };

  if (!childId) {
    return (
      <Pressable
        style={styles.emptyCard}
        onPress={async () => {
          await HapticService.buttonPress();
          onSelectChild?.();
        }}
      >
        <Text style={styles.emptyTitle}>Pilih Anak</Text>
        <Text style={styles.emptySubtitle}>
          Pilih anak aktif untuk menampilkan pengukuran live & Z-score WHO.
        </Text>
      </Pressable>
    );
  }

  if (showSkeleton || (isFetching && !latestDb && !hasLiveOrDb)) {
    return (
      <View style={styles.container}>
        <SkeletonLoader variant="card" count={1} style={styles.skeletonPad} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={['rgba(182, 0, 89, 0.35)', 'rgba(182, 0, 89, 0)']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <BlurView intensity={50} tint="light" style={styles.blurCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', colors.primary.fixed]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📡</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isConnected
                      ? colors.status.success
                      : colors.neutral.gray500,
                  },
                ]}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Live Sensor</Text>
              <Text style={styles.subtitle}>
                {isConnected ? 'MQTT · sync Supabase' : 'Tidak Terhubung'}
                {isFetching ? ' · syncing…' : ''}
              </Text>
            </View>
            {hasLiveOrDb ? (
              <View style={[styles.qualityBadge, { backgroundColor: getQualityColor() }]}>
                <Text style={styles.qualityText}>
                  {quality === 'excellent'
                    ? 'Sangat Baik'
                    : quality === 'good'
                      ? 'Baik'
                      : quality === 'fair'
                        ? 'Cukup'
                        : 'Kurang'}
                </Text>
              </View>
            ) : null}
          </View>

          {!hasLiveOrDb ? (
            <View style={styles.waitingBox}>
              <Text style={styles.waitingTitle}>Belum ada pengukuran</Text>
              <Text style={styles.waitingHint}>
                Hubungkan perangkat IoT atau lakukan ukur manual.
              </Text>
            </View>
          ) : (
            <View style={styles.mainDisplay}>
              <View style={styles.measurement}>
                <Text style={styles.label}>Tinggi Badan</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{displayHeight.toFixed(1)}</Text>
                  <Text style={styles.unit}>cm</Text>
                </View>
              </View>

              {displayWeight > 0 ? (
                <View style={styles.measurement}>
                  <Text style={styles.label}>Berat Badan</Text>
                  <View style={styles.valueContainer}>
                    <Text style={styles.value}>{displayWeight.toFixed(1)}</Text>
                    <Text style={styles.unit}>kg</Text>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.zPanel}>
            <Text style={styles.zTitle}>WHO Z-Score (tersimpan)</Text>
            {!latestDb ? (
              <Text style={styles.zEmpty}>Belum ada pengukuran</Text>
            ) : isError ? (
              <Text style={styles.zEmpty}>Gagal memuat data</Text>
            ) : (
              <View style={styles.zRow}>
                <View style={styles.zItem}>
                  <Text style={styles.zLabel}>TB/U</Text>
                  <Text style={styles.zValue}>
                    {latestDb.z_score_hfa != null
                      ? latestDb.z_score_hfa.toFixed(2)
                      : '—'}
                  </Text>
                </View>
                <View style={styles.zItem}>
                  <Text style={styles.zLabel}>BB/U</Text>
                  <Text style={styles.zValue}>
                    {latestDb.z_score_wfa != null
                      ? latestDb.z_score_wfa.toFixed(2)
                      : '—'}
                  </Text>
                </View>
                <View style={styles.zItem}>
                  <Text style={styles.zLabel}>Risiko</Text>
                  <Text
                    style={[
                      styles.zValue,
                      styles.zRisk,
                      stunting ? { color: stunting.color } : null,
                    ]}
                  >
                    {stunting?.label ?? '—'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  skeletonPad: {
    padding: 0,
  },
  emptyCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: 18,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.styles.bodyMd,
    fontSize: 14,
    color: colors.text.secondary,
  },
  waitingBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  waitingHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  glowContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: 0,
  },
  glow: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  blurCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  icon: { fontSize: 32 },
  statusDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  headerText: { flex: 1 },
  title: {
    ...typography.styles.headlineLgMobile,
    fontSize: 18,
    color: colors.text.onSurface,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  qualityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  qualityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.inverse,
  },
  mainDisplay: { marginBottom: spacing.md },
  measurement: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.primary.main,
    letterSpacing: -2,
  },
  unit: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },
  zPanel: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.divider,
  },
  zTitle: {
    ...typography.styles.labelCaps,
    color: colors.text.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  zEmpty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  zRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zItem: { flex: 1, alignItems: 'center' },
  zLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  zValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
  },
  zRisk: {
    fontSize: typography.fontSize.sm,
  },
});

export default LiveMeasurementCard;
