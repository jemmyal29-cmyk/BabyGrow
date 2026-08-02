/**
 * Growth Screen — grafik dari measurements Supabase (bukan mock)
 * Visual: Growth Trends (desainuiux.md)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../store/authStore';
import { useChildStore } from '../store/childStore';
import { ageLabelFromDob, useChildren } from '../hooks/useChildren';
import {
  getStuntingDisplay,
  useChildMeasurements,
  useLatestMeasurement,
} from '../hooks/useMeasurements';
import { calculateAgeInMonths } from '../utils/zScoreCalculator';
import { ScreenHeader, SkeletonLoader } from '../components/common';
import HapticService from '../services/HapticService';
import type { MeasurementRow } from '../types/database';

type MetricType = 'weight' | 'height' | 'head';

const METRICS: {
  id: MetricType;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  unit: string;
}[] = [
  { id: 'weight', label: 'Berat', icon: 'scale-bathroom', unit: 'kg' },
  { id: 'height', label: 'Tinggi', icon: 'human-male-height', unit: 'cm' },
  { id: 'head', label: 'Lingkar Kepala', icon: 'head', unit: 'cm' },
];

function metricValue(m: MeasurementRow, metric: MetricType): number | null {
  if (metric === 'weight') {
    return m.weight_kg != null ? Number(m.weight_kg) : null;
  }
  if (metric === 'height') return Number(m.height_cm);
  return m.head_circumference_cm != null
    ? Number(m.head_circumference_cm)
    : null;
}

function isNormalPoint(m: MeasurementRow): boolean {
  const risk = m.stunting_risk;
  return !risk || risk === 'normal';
}

export default function GrowthScreen() {
  const { user } = useAuth();
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const activeChildId = useChildStore((s) => s.activeChildId);
  const { data: children = [], isPending: childrenLoading } = useChildren({
    parentId: user?.id,
  });
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('height');

  useEffect(() => {
    if (children.length === 0) return;
    const preferred = activeChildId
      ? children.find((c) => c.id === activeChildId)
      : undefined;
    const next = preferred ?? children[0];
    if (activeChildId === next.id) return;
    setActiveChild({
      id: next.id,
      name: next.name,
      gender: next.gender,
      date_of_birth: next.date_of_birth,
    });
  }, [children, activeChildId, setActiveChild]);

  const childId = activeChildId;
  const activeChild = children.find((c) => c.id === childId) ?? null;

  const { data: series = [], isPending: seriesLoading } =
    useChildMeasurements(childId);
  const { data: latest } = useLatestMeasurement(childId);

  const chartPoints = useMemo(() => {
    return series
      .map((m) => {
        const value = metricValue(m, selectedMetric);
        if (value == null || Number.isNaN(value)) return null;
        const ageMonths = activeChild
          ? calculateAgeInMonths(activeChild.date_of_birth)
          : 0;
        let monthLabel = ageMonths;
        if (activeChild?.date_of_birth && m.measured_at) {
          const dob = new Date(activeChild.date_of_birth);
          const at = new Date(m.measured_at);
          monthLabel =
            (at.getFullYear() - dob.getFullYear()) * 12 +
            (at.getMonth() - dob.getMonth());
          if (at.getDate() < dob.getDate()) monthLabel -= 1;
          if (monthLabel < 0) monthLabel = 0;
        }
        return {
          id: m.id,
          month: monthLabel,
          value,
          normal: isNormalPoint(m),
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      month: number;
      value: number;
      normal: boolean;
    }>;
  }, [series, selectedMetric, activeChild]);

  const currentMetric = METRICS.find((m) => m.id === selectedMetric)!;
  const maxVal = Math.max(...chartPoints.map((d) => d.value), 1);

  const latestDisplay = useMemo(() => {
    if (!latest) return null;
    const v = metricValue(latest, selectedMetric);
    const stunting = getStuntingDisplay({
      stunting_risk: latest.stunting_risk,
      z_score_hfa: latest.z_score_hfa,
      z_score_wfa: latest.z_score_wfa,
    });
    return { value: v, stunting, measured_at: latest.measured_at };
  }, [latest, selectedMetric]);

  const selectChild = async (id: string) => {
    await HapticService.light();
    const c = children.find((x) => x.id === id);
    if (!c) return;
    setActiveChild({
      id: c.id,
      name: c.name,
      gender: c.gender,
      date_of_birth: c.date_of_birth,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Growth Trends"
        brand
        subtitle="Grafik dari pengukuran anak"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            {currentMetric.label} Analysis
          </Text>
          <Text style={styles.introSub}>
            {activeChild
              ? `Overview · ${ageLabelFromDob(activeChild.date_of_birth)}`
              : 'Pilih anak untuk melihat tren'}
          </Text>
        </View>

        {childrenLoading ? (
          <SkeletonLoader variant="list" count={1} />
        ) : children.length === 0 ? (
          <Text style={styles.empty}>
            Belum ada anak. Tambahkan profil anak dulu.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
            contentContainerStyle={styles.childSelectorContent}
          >
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  childId === child.id && styles.childChipActive,
                ]}
                onPress={() => selectChild(child.id)}
              >
                <Text
                  style={[
                    styles.childChipText,
                    childId === child.id && styles.childChipTextActive,
                  ]}
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.metricSelector}>
          {METRICS.map((metric) => {
            const active = selectedMetric === metric.id;
            return (
              <TouchableOpacity
                key={metric.id}
                style={[styles.metricButton, active && styles.metricButtonActive]}
                onPress={async () => {
                  await HapticService.light();
                  setSelectedMetric(metric.id);
                }}
              >
                <MaterialCommunityIcons
                  name={metric.icon}
                  size={18}
                  color={active ? colors.primary.main : colors.text.secondary}
                />
                <Text
                  style={[styles.metricText, active && styles.metricTextActive]}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <View>
              <Text style={styles.chartEyebrow}>Current {currentMetric.label}</Text>
              <Text style={styles.chartValue}>
                {latestDisplay?.value != null
                  ? latestDisplay.value.toFixed(1)
                  : '—'}{' '}
                <Text style={styles.chartUnit}>{currentMetric.unit}</Text>
              </Text>
            </View>
            {latestDisplay?.stunting ? (
              <View style={styles.trendPill}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={14}
                  color={colors.primary.main}
                />
                <Text style={styles.trendPillText}>
                  {latestDisplay.stunting.label}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.chartSubtitle}>
            Data pengukuran · satuan {currentMetric.unit}
          </Text>

          {seriesLoading ? (
            <SkeletonLoader variant="stat" count={1} style={{ padding: 0 }} />
          ) : chartPoints.length === 0 ? (
            <Text style={styles.empty}>
              Belum ada pengukuran untuk metrik ini.
            </Text>
          ) : (
            <View style={styles.chartContainer}>
              {chartPoints.slice(-8).map((item) => (
                <View key={item.id} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(12, (item.value / maxVal) * 150),
                          backgroundColor: item.normal
                            ? colors.primary.main
                            : colors.status.warning,
                        },
                      ]}
                    >
                      <Text style={styles.barValue}>
                        {item.value.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{item.month}bln</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.latestCard}>
          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name="auto-fix"
                size={22}
                color={colors.primary.onPrimary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.latestTitle}>Growth Summary</Text>
              {!latestDisplay || latestDisplay.value == null ? (
                <Text style={styles.emptyInline}>Belum ada pengukuran</Text>
              ) : (
                <View style={styles.latestRow}>
                  <View style={styles.latestItem}>
                    <Text style={styles.latestLabel}>Nilai</Text>
                    <Text style={styles.latestValue}>
                      {latestDisplay.value.toFixed(1)} {currentMetric.unit}
                    </Text>
                  </View>
                  <View style={styles.latestItem}>
                    <Text style={styles.latestLabel}>Status</Text>
                    <Text
                      style={[
                        styles.latestValueSm,
                        {
                          color:
                            latestDisplay.stunting?.color ??
                            colors.text.secondary,
                        },
                      ]}
                    >
                      {latestDisplay.stunting?.label ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.latestItem}>
                    <Text style={styles.latestLabel}>Z TB/U</Text>
                    <Text style={styles.latestValue}>
                      {latest?.z_score_hfa != null
                        ? Number(latest.z_score_hfa).toFixed(2)
                        : '—'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
    gap: spacing.md,
  },
  intro: { marginBottom: spacing.xs },
  introTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
  },
  introSub: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    padding: spacing.lg,
  },
  emptyInline: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  childSelector: { marginBottom: spacing.xs },
  childSelectorContent: { gap: spacing.sm, paddingRight: spacing.md },
  childChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    borderWidth: 1,
    borderColor: colors.border.divider,
    ...shadows.sm,
  },
  childChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  childChipText: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  childChipTextActive: { color: colors.primary.onPrimary },
  metricSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.divider,
    ...shadows.sm,
  },
  metricButtonActive: {
    backgroundColor: colors.primary.fixed,
    borderColor: colors.primary.main,
  },
  metricText: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  metricTextActive: { color: colors.primary.main },
  chartCard: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  chartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  chartEyebrow: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  chartValue: {
    ...typography.styles.headlineLg,
    color: colors.text.onSurface,
  },
  chartUnit: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(182, 0, 89, 0.1)',
    paddingHorizontal: spacing.element,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  trendPillText: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.primary.main,
  },
  chartSubtitle: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: { alignItems: 'center', flex: 1 },
  barWrapper: { height: 150, justifyContent: 'flex-end', marginBottom: 8 },
  bar: {
    width: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.onPrimary,
  },
  barLabel: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.text.secondary,
  },
  latestCard: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  insightRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: 18,
    color: colors.text.onSurface,
    marginBottom: spacing.md,
  },
  latestRow: { flexDirection: 'row', justifyContent: 'space-between' },
  latestItem: { alignItems: 'flex-start', flex: 1 },
  latestLabel: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  latestValue: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
  },
  latestValueSm: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
  },
});
