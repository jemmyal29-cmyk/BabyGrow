import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

type MetricType = 'weight' | 'height' | 'head';

interface Metric {
  id: MetricType;
  label: string;
  icon: string;
  unit: string;
}

interface DataPoint {
  month: number;
  value: number;
  normal: boolean;
}

export default function GrowthScreen() {
  const [selectedChild, setSelectedChild] = useState('Aisha Putri');
  const [selectedMetric, setSelectedMetric] = useState('weight');

  const children = ['Aisha Putri', 'Budi Santoso'];
  const metrics = [
    { id: 'weight', label: 'Berat', icon: '⚖️', unit: 'kg' },
    { id: 'height', label: 'Tinggi', icon: '📏', unit: 'cm' },
    { id: 'head', label: 'Lingkar Kepala', icon: '⭕', unit: 'cm' },
  ];

  // Sample data dengan satuan yang jelas
  const growthData = {
    weight: [
      { month: 0, value: 3.2, normal: true },
      { month: 2, value: 5.1, normal: true },
      { month: 4, value: 6.8, normal: true },
      { month: 6, value: 7.5, normal: true },
      { month: 8, value: 8.2, normal: true },
      { month: 12, value: 9.5, normal: true },
    ],
    height: [
      { month: 0, value: 48.5, normal: true },
      { month: 2, value: 56.2, normal: true },
      { month: 4, value: 62.8, normal: true },
      { month: 6, value: 66.3, normal: true },
      { month: 8, value: 69.7, normal: true },
      { month: 12, value: 75.0, normal: true },
    ],
    head: [
      { month: 0, value: 34.5, normal: true },
      { month: 2, value: 38.2, normal: true },
      { month: 4, value: 40.8, normal: true },
      { month: 6, value: 42.5, normal: true },
      { month: 8, value: 43.8, normal: true },
      { month: 12, value: 45.5, normal: true },
    ],
  };

  const currentData = growthData[selectedMetric as keyof typeof growthData] || [];
  const currentMetric = metrics.find((m) => m.id === selectedMetric);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Grafik Pertumbuhan</Text>
        </View>

        {/* Child Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.childSelector}
        >
          {children.map((child) => (
            <TouchableOpacity
              key={child}
              style={[
                styles.childChip,
                selectedChild === child && styles.childChipActive,
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text
                style={[
                  styles.childChipText,
                  selectedChild === child && styles.childChipTextActive,
                ]}
              >
                {child}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Metric Selector */}
        <View style={styles.metricSelector}>
          {metrics.map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={[
                styles.metricButton,
                selectedMetric === metric.id && styles.metricButtonActive,
              ]}
              onPress={() => setSelectedMetric(metric.id)}
            >
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text
                style={[
                  styles.metricText,
                  selectedMetric === metric.id && styles.metricTextActive,
                ]}
              >
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            📊 Grafik {currentMetric?.label}
          </Text>
          <Text style={styles.chartSubtitle}>
            Satuan: {currentMetric?.unit} • Berdasarkan Standar WHO
          </Text>

          {/* Simple Bar Chart */}
          <View style={styles.chartContainer}>
            {currentData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (item.value / Math.max(...currentData.map(d => d.value))) * 150,
                        backgroundColor: item.normal ? colors.status.success : colors.status.error,
                      },
                    ]}
                  >
                    <Text style={styles.barValue}>
                      {item.value}{currentMetric?.id === 'height' || currentMetric?.id === 'head' ? ' cm' : ' kg'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.month}bln</Text>
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.success }]} />
              <Text style={styles.legendText}>Normal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.status.error }]} />
              <Text style={styles.legendText}>Perlu Perhatian</Text>
            </View>
          </View>
        </View>

        {/* Latest Measurement */}
        <View style={styles.latestCard}>
          <Text style={styles.latestTitle}>📊 Pengukuran Terakhir</Text>
          <View style={styles.latestRow}>
            <View style={styles.latestItem}>
              <Text style={styles.latestLabel}>Nilai</Text>
              <Text style={styles.latestValue}>
                {currentData[currentData.length - 1]?.value} {currentMetric?.unit}
              </Text>
            </View>
            <View style={styles.latestItem}>
              <Text style={styles.latestLabel}>Usia</Text>
              <Text style={styles.latestValue}>
                {currentData[currentData.length - 1]?.month} bulan
              </Text>
            </View>
            <View style={styles.latestItem}>
              <Text style={styles.latestLabel}>Status</Text>
              <Text style={[styles.latestValue, { color: colors.status.success }]}>
                Normal ✓
              </Text>
            </View>
          </View>
        </View>

        {/* AI Analysis Card */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 Analisis AI</Text>
          <Text style={styles.aiText}>
            Pertumbuhan {selectedChild} berada dalam rentang normal sesuai standar WHO.
            Teruskan pola makan sehat dan konsultasi rutin dengan dokter.
          </Text>
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>Lihat Detail Analisis →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid white background
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding untuk bottom tabs
    backgroundColor: '#FFFFFF', // Solid white background
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
  },
  childSelector: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  childChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#F5F5F5', // Solid light gray
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray400,
  },
  childChipActive: {
    backgroundColor: '#FF69B4', // Solid pink
    borderColor: '#FF1493',
    borderWidth: 3,
  },
  childChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray600,
  },
  childChipTextActive: {
    color: colors.neutral.white,
  },
  metricSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: '#F5F5F5', // Solid light gray
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.neutral.gray400,
  },
  metricButtonActive: {
    backgroundColor: '#FFE4F3', // Solid pink background
    borderColor: colors.primary.main,
    borderWidth: 3,
  },
  metricIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.xs,
  },
  metricText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray600,
  },
  metricTextActive: {
    color: colors.primary.main,
  },
  chartCard: {
    backgroundColor: '#FFFFFF', // Solid white
    margin: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  chartTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 40,
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  latestCard: {
    backgroundColor: '#FFFFFF', // Solid white
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  latestTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  latestRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  latestItem: {
    alignItems: 'center',
  },
  latestLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  latestValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  aiCard: {
    backgroundColor: '#F3E5F5', // Solid purple background
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#9C27B0',
    borderColor: '#E1BEE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aiTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  aiText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  aiButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  aiButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
});
