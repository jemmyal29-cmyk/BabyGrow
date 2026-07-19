/**
 * Growth Chart Screen — measurements from Supabase via React Query
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useChildMeasurements } from '../hooks/useChildrenQueries';
import { Button } from '../components/common';

const { width } = Dimensions.get('window');

type Metric = 'weight' | 'height' | 'zscore';

export default function GrowthChartScreen({ navigation, route }: any) {
  const childId: string | undefined = route?.params?.childId;
  const [metric, setMetric] = useState<Metric>('height');
  const { data: measurements = [], isLoading, isError, error, refetch } =
    useChildMeasurements(childId);

  const chart = useMemo(() => {
    if (measurements.length === 0) {
      return {
        labels: ['—'],
        datasets: [{ data: [0] }],
      };
    }

    const slice = measurements.slice(-6);
    const labels = slice.map((m) => {
      const d = new Date(m.measured_at);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const data = slice.map((m) => {
      if (metric === 'weight') return Number(m.weight_kg ?? 0);
      if (metric === 'zscore') return Number(m.z_score_hfa ?? 0);
      return Number(m.height_cm ?? 0);
    });

    return {
      labels,
      datasets: [{ data: data.length ? data : [0] }],
    };
  }, [measurements, metric]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Grafik Pertumbuhan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metricRow}>
          {(
            [
              { key: 'height', label: 'Tinggi' },
              { key: 'weight', label: 'Berat' },
              { key: 'zscore', label: 'Z-Score' },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.metricBtn, metric === item.key && styles.metricBtnActive]}
              onPress={() => setMetric(item.key)}
            >
              <Text
                style={[
                  styles.metricText,
                  metric === item.key && styles.metricTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!childId ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pilih anak terlebih dahulu</Text>
            <Text style={styles.emptyDesc}>
              Buka tab Anak, lalu ketuk Grafik pada kartu anak.
            </Text>
          </View>
        ) : null}

        {childId && isLoading ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.xl }} />
        ) : null}

        {childId && isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Gagal memuat pengukuran</Text>
            <Text style={styles.emptyDesc}>{(error as Error)?.message}</Text>
            <Button title="Coba Lagi" onPress={() => refetch()} style={{ marginTop: spacing.md }} />
          </View>
        ) : null}

        {childId && !isLoading && !isError ? (
          <View style={styles.chartCard}>
            {measurements.length === 0 ? (
              <Text style={styles.emptyDesc}>
                Belum ada data pengukuran di Supabase untuk anak ini.
              </Text>
            ) : (
              <LineChart
                data={chart}
                width={width - 48}
                height={220}
                chartConfig={{
                  backgroundColor: colors.neutral.white,
                  backgroundGradientFrom: colors.neutral.white,
                  backgroundGradientTo: colors.primary.lighter,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 25, 118, ${opacity})`,
                  labelColor: () => colors.text.secondary,
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: colors.primary.main,
                  },
                }}
                bezier
                style={styles.chart}
              />
            )}
            <Text style={styles.caption}>
              {measurements.length} pengukuran · sumber MQTT / manual
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.elevated,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  metricBtnActive: {
    backgroundColor: colors.primary.main,
  },
  metricText: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
  metricTextActive: {
    color: colors.text.inverse,
  },
  chartCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  caption: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  empty: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.soft,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
