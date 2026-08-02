/**
 * Growth Chart Screen — desainuiux.md + Supabase React Query
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
import {colors, typography, spacing, borderRadius, shadows} from '../theme';
import { useChildMeasurements } from '../hooks/useMeasurements';
import { Button, Card, ScreenHeader } from '../components/common';
import HapticService from '../services/HapticService';

const { width } = Dimensions.get('window');

type Metric = 'weight' | 'height' | 'zscore';

export default function GrowthChartScreen({ navigation, route }: any) {
  const childId: string | undefined = route?.params?.childId;
  const [metric, setMetric] = useState<Metric>('height');
  const { data: measurements = [], isLoading, isError, error, refetch } =
    useChildMeasurements(childId);

  const chart = useMemo(() => {
    if (measurements.length === 0) {
      return { labels: ['—'], datasets: [{ data: [0] }] };
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
    return { labels, datasets: [{ data: data.length ? data : [0] }] };
  }, [measurements, metric]);

  const selectMetric = async (key: Metric) => {
    await HapticService.buttonPress();
    setMetric(key);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title="Growth Trends"
        subtitle="Riwayat pengukuran anak"
        onBack={() => navigation.goBack()}
      />

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
              onPress={() => selectMetric(item.key)}
            >
              <Text
                style={[styles.metricText, metric === item.key && styles.metricTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!childId ? (
          <Card>
            <Text style={styles.emptyTitle}>Pilih anak terlebih dahulu</Text>
            <Text style={styles.emptyDesc}>
              Buka tab Anak, lalu ketuk Grafik pada kartu anak.
            </Text>
          </Card>
        ) : null}

        {childId && isLoading ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.xl }} />
        ) : null}

        {childId && isError ? (
          <Card>
            <Text style={styles.emptyTitle}>Gagal memuat pengukuran</Text>
            <Text style={styles.emptyDesc}>{(error as Error)?.message}</Text>
            <Button title="Coba Lagi" onPress={() => refetch()} style={{ marginTop: spacing.md }} />
          </Card>
        ) : null}

        {childId && !isLoading && !isError ? (
          <Card padding="medium">
            {measurements.length === 0 ? (
              <Text style={styles.emptyDesc}>
                Belum ada data pengukuran untuk anak ini.
              </Text>
            ) : (
              <LineChart
                data={chart}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: colors.surface.lowest,
                  backgroundGradientFrom: colors.surface.lowest,
                  backgroundGradientTo: colors.primary.fixed,
                  decimalPlaces: 1,
                  color: (opacity = 1) => colors.primary.main,
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
              {measurements.length} pengukuran · manual / alat / AI
            </Text>
          </Card>
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
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
    gap: spacing.stackGap,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.element,
  },
  metricBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    alignItems: 'center',
    backgroundColor: colors.surface.lowest,
  },
  metricBtnActive: {
    backgroundColor: colors.primary.main,
    ...shadows.primaryGlow,
  },
  metricText: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
    fontSize: typography.fontSize.sm,
  },
  metricTextActive: {
    color: colors.primary.onPrimary,
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
  emptyTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
