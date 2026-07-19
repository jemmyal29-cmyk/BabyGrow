/**
 * Live Measurement Card — MQTT-backed live sensor display
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

interface LiveMeasurementCardProps {
  height?: number;
  weight?: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  isConnected?: boolean;
  /** When true, subscribe directly to MQTT singleton stream */
  bindMqtt?: boolean;
}

export function LiveMeasurementCard({
  height: heightProp = 0,
  weight: weightProp = 0,
  quality: qualityProp = 'good',
  isConnected: connectedProp = false,
  bindMqtt = false,
}: LiveMeasurementCardProps) {
  const [height, setHeight] = useState(heightProp);
  const [weight, setWeight] = useState(weightProp);
  const [quality, setQuality] = useState(qualityProp);
  const [isConnected, setIsConnected] = useState(connectedProp);
  const [displayHeight, setDisplayHeight] = useState(0);
  const glowOpacity = useSharedValue(0);

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
    const onMeasurement = (data: unknown) => {
      const m = data as MQTTMeasurement;
      setHeight(m.height_cm);
      setWeight(m.weight_kg || 0);
      setQuality(m.quality);
      setIsConnected(true);
    };

    mqtt.on('connected', onConnected);
    mqtt.on('offline', onOffline);
    mqtt.on('disconnected', onOffline);
    mqtt.on('measurement', onMeasurement);

    return () => {
      mqtt.off('connected', onConnected);
      mqtt.off('offline', onOffline);
      mqtt.off('disconnected', onOffline);
      mqtt.off('measurement', onMeasurement);
    };
  }, [bindMqtt, heightProp, weightProp, qualityProp, connectedProp]);

  useEffect(() => {
    if (!isConnected || height <= 0) return;

    const interval = setInterval(() => {
      setDisplayHeight((prev) => {
        const diff = height - prev;
        if (Math.abs(diff) < 0.1) return height;
        return prev + diff * 0.15;
      });
    }, 50);

    glowOpacity.value = withTiming(1, { duration: 300 }, () => {
      glowOpacity.value = withTiming(0, { duration: 1000 });
    });

    return () => clearInterval(interval);
  }, [height, isConnected, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return colors.status.success;
      case 'good':
        return '#8BC34A';
      case 'fair':
        return colors.status.warning;
      case 'poor':
        return colors.status.error;
      default:
        return colors.neutral.gray500;
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'excellent':
        return 'Sangat Baik';
      case 'good':
        return 'Baik';
      case 'fair':
        return 'Cukup';
      case 'poor':
        return 'Kurang';
      default:
        return '—';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={['rgba(255, 25, 118, 0.35)', 'rgba(255, 25, 118, 0)']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <BlurView intensity={50} tint="light" style={styles.blurCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 228, 243, 0.45)']}
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
                {isConnected ? 'Terhubung (MQTT)' : 'Tidak Terhubung'}
              </Text>
            </View>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor() }]}>
              <Text style={styles.qualityText}>{getQualityText()}</Text>
            </View>
          </View>

          <View style={styles.mainDisplay}>
            <View style={styles.measurement}>
              <Text style={styles.label}>Tinggi Badan</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{displayHeight.toFixed(1)}</Text>
                <Text style={styles.unit}>cm</Text>
              </View>
              <View style={styles.indicator}>
                <View
                  style={[
                    styles.indicatorBar,
                    { width: `${Math.min((height / 120) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>

            {weight > 0 ? (
              <View style={styles.measurement}>
                <Text style={styles.label}>Berat Badan</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{weight.toFixed(1)}</Text>
                  <Text style={styles.unit}>kg</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.deviceText}>ESP32 · WebSocket MQTT</Text>
            <Text style={styles.timestamp}>
              {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Text>
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
    borderRadius: borderRadius.lg,
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
  icon: {
    fontSize: 32,
  },
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  qualityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  qualityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.inverse,
  },
  mainDisplay: {
    marginBottom: spacing.md,
  },
  measurement: {
    marginBottom: spacing.md,
  },
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
  indicator: {
    height: 6,
    backgroundColor: colors.primary.lighter,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  indicatorBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.divider,
  },
  deviceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.secondary,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
  },
});

export default LiveMeasurementCard;
