/**
 * BabyGrow Growth Chart Component
 * Displays child's growth trajectory with WHO standards
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {colors, typography, spacing, borderRadius} from '../../theme';
import { GrowthDataPoint } from '../../types/models';

const screenWidth = Dimensions.get('window').width;

export interface GrowthChartProps {
  data: GrowthDataPoint[];
  metric: 'weight' | 'height';
  showWHOStandards?: boolean;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  metric,
  showWHOStandards = true,
}) => {
  // Prepare chart data
  const labels = data.map(point => {
    const months = point.ageMonths;
    if (months < 12) return `${months}m`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y${remainingMonths}m` : `${years}y`;
  });

  const values = data.map(point => 
    metric === 'weight' ? point.weight || 0 : point.height || 0
  );

  const chartData = {
    labels: labels.length > 6 ? labels.filter((_, i) => i % 2 === 0) : labels,
    datasets: [
      {
        data: values,
        color: (opacity = 1) => colors.primary.main,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.background.paper,
    backgroundGradientFrom: colors.background.paper,
    backgroundGradientTo: colors.background.paper,
    decimalPlaces: 1,
    color: (opacity = 1) => colors.primary.main,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.primary.main,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border.light,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {metric === 'weight' ? 'Grafik Berat Badan' : 'Grafik Tinggi Badan'}
      </Text>
      
      <Text style={styles.subtitle}>
        {metric === 'weight' ? 'Kilogram (kg)' : 'Sentimeter (cm)'}
      </Text>

      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary.main }]} />
          <Text style={styles.legendText}>Data Anak</Text>
        </View>
        {showWHOStandards && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.status.success }]} />
            <Text style={styles.legendText}>Standar WHO</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.DEFAULT,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
});

export default GrowthChart;
