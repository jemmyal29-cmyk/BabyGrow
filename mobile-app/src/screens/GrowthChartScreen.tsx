/**
 * Growth Chart Screen - Professional Interactive Charts
 * 3D shadows, elegant data transitions, and time range filters
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
// import { useDarkMode } from '../hooks/useDarkMode';
const { isDarkMode } = { isDarkMode: false }; // Temporary fix

const { width } = Dimensions.get('window');

interface GrowthChartScreenProps {
  navigation: any;
  route: any;
}

type TimeRange = 'weekly' | 'monthly' | 'yearly';

export default function GrowthChartScreen({ navigation, route }: GrowthChartScreenProps) {
  const { isDarkMode } = { isDarkMode: false }; // Temporary fix 
  const [selectedRange, setSelectedRange] = useState<TimeRange>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'height' | 'zscore'>('weight');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [10, 10.5, 11, 11.2, 11.5, 11.8]
    }]
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedRange === range && {
              backgroundColor: isDarkMode ? colors.pink[100] : colors.pink.main,
            },
            { borderColor: isDarkMode ? colors.pink.main : colors.pink.main },
          ]}
          onPress={() => setSelectedRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              selectedRange === range && { color: '#FFFFFF' },
              selectedRange !== range && { 
                color: isDarkMode ? colors.pink[300] : colors.pink.main 
              },
            ]}
          >
            {range === 'weekly' && 'Mingguan'}
            {range === 'monthly' && 'Bulanan'}
            {range === 'yearly' && 'Tahunan'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricSelector = () => (
    <View style={styles.metricContainer}>
      {([
        { key: 'weight', label: '⚖️ Berat', unit: 'kg' },
        { key: 'height', label: '📏 Tinggi', unit: 'cm' },
        { key: 'zscore', label: '📊 Z-Score', unit: '' },
      ] as Array<{ key: 'weight' | 'height' | 'zscore'; label: string; unit: string }>).map((metric) => (
        <TouchableOpacity
          key={metric.key}
          style={[
            styles.metricButton,
            selectedMetric === metric.key && {
              backgroundColor: isDarkMode ? colors.pink[100] : colors.pink.main,
            },
            {
              backgroundColor: selectedMetric === metric.key 
                ? (isDarkMode ? colors.pink[400] : colors.pink.main)
                : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF'),
            }
          ]}
          onPress={() => setSelectedMetric(metric.key)}
        >
          <Text
            style={[
              styles.metricText,
              {
                color: selectedMetric === metric.key 
                  ? '#FFFFFF'
                  : (isDarkMode ? '#FFFFFF' : colors.text.primary),
              }
            ]}
          >
            {metric.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    // Mock data for demonstration
    const mockData = [
      { x: 0, y: 3.2, label: 'Lahir' },
      { x: 3, y: 5.8, label: '3m' },
      { x: 6, y: 7.4, label: '6m' },
      { x: 12, y: 9.2, label: '12m' },
      { x: 18, y: 10.5, label: '18m' },
    ];
    
    return (
      <View style={styles.customChart}>
        <View style={styles.chartHeader}>
          <Text style={[
            styles.chartAxisLabel,
            { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
          ]}>
            {selectedMetric === 'weight' && 'Berat (kg)'}
            {selectedMetric === 'height' && 'Tinggi (cm)'}
            {selectedMetric === 'zscore' && 'Z-Score'}
          </Text>
        </View>
        
        <View style={styles.chartData}>
          {chartData.datasets[0].data.map((value, index) => {
            const maxValue = Math.max(...chartData.datasets[0].data);
            const minValue = Math.min(...chartData.datasets[0].data);
            const normalizedHeight = ((value - minValue) / (maxValue - minValue)) * 200;
            
            return (
              <View key={index} style={styles.chartColumn}>
                <Text style={[
                  styles.chartValue,
                  { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
                ]}>
                  {value.toFixed(1)}
                </Text>
                <View style={[
                  styles.chartBar,
                  {
                    height: normalizedHeight || 20,
                    backgroundColor: colors.pink.main,
                  }
                ]} />
                <Text style={[
                  styles.chartLabel,
                  { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
                ]}>
                  {chartData.labels[index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={[
        styles.summaryCard,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
      ]}>
        <Text style={styles.summaryIcon}>📈</Text>
        <Text style={[
          styles.summaryTitle,
          { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
        ]}>
          Tren Pertumbuhan
        </Text>
        <Text style={[
          styles.summaryValue,
          { color: colors.status.success }
        ]}>
          ↗️ Positif
        </Text>
        <Text style={[
          styles.summarySubtext,
          { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
        ]}>
          Naik konsisten 3 bulan terakhir
        </Text>
      </View>

      <View style={[
        styles.summaryCard,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
      ]}>
        <Text style={styles.summaryIcon}>🎯</Text>
        <Text style={[
          styles.summaryTitle,
          { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
        ]}>
          Target WHO
        </Text>
        <Text style={[
          styles.summaryValue,
          { color: colors.status.success }
        ]}>
          Normal
        </Text>
        <Text style={[
          styles.summarySubtext,
          { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
        ]}>
          Dalam rentang standar
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#212529' : colors.background.default }
    ]} edges={['top']}>
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDarkMode ? '#343a40' : '#FFFFFF' }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[
            styles.backIcon,
            { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
          ]}>←</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
        ]}>
          📊 Grafik Pertumbuhan
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Time Range Selector */}
          {renderTimeRangeSelector()}

          {/* Metric Selector */}
          {renderMetricSelector()}

          {/* Chart Card */}
          <View style={[
            styles.chartCard,
            { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF',
              ...shadows.lg 
            }
          ]}>
            <Text style={[
              styles.chartTitle,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              {selectedMetric === 'weight' && '⚖️ Grafik Berat Badan'}
              {selectedMetric === 'height' && '📏 Grafik Tinggi Badan'}
              {selectedMetric === 'zscore' && '📊 Analisis Z-Score WHO'}
            </Text>
            
            <View style={styles.chartContainer}>
              {renderChart()}
            </View>
          </View>

          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Recommendations */}
          <View style={[
            styles.recommendationsCard,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.recommendationsTitle,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              💡 Rekomendasi
            </Text>
            <Text style={[
              styles.recommendationItem,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Pertahankan pola makan bergizi seimbang
            </Text>
            <Text style={[
              styles.recommendationItem,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Lakukan pengukuran rutin setiap 2 minggu
            </Text>
            <Text style={[
              styles.recommendationItem,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Konsultasi dengan dokter jika tren menurun
            </Text>
          </View>
        </Animated.View>

        {/* UIGM Developer Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.uigmFooter}>
            <Text style={styles.uigmTitle}>🎓 Developed by</Text>
            <Text style={styles.uigmAuthor}>Jemi Altio</Text>
            <Text style={styles.uigmDepartment}>Sistem Komputer</Text>
            <Text style={styles.uigmUniversity}>Universitas Indo Global Mandiri</Text>
            <Text style={styles.uigmYear}>© 2026</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shareIcon: {
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeRangeButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    ...shadows.soft,
  },
  timeRangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
  },
  metricContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.standard,
  },
  metricText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  customChart: {
    padding: spacing.md,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: borderRadius.lg,
    minHeight: 280,
  },
  chartData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    paddingTop: spacing.lg,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
    marginBottom: spacing.xs,
  },
  chartBar: {
    width: 20,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  chartAxisLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.standard,
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  summaryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  recommendationsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.standard,
  },
  recommendationsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.md,
  },
  recommendationItem: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  // UIGM Developer Footer
  footerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  uigmFooter: {
    backgroundColor: colors.neutral.gray100,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
  },
  uigmTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  uigmAuthor: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  uigmDepartment: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  uigmUniversity: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  uigmYear: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
});
