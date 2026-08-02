/**
 * Real-Time Height Display Component
 * Shows live height data from BLE device
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import BLEService from '../../services/BLEService';
import {colors, typography, spacing, borderRadius, shadows} from '../../theme';

interface RealTimeHeightDisplayProps {
  visible: boolean;
  onHeightUpdate?: (height: number) => void;
}

export const RealTimeHeightDisplay: React.FC<RealTimeHeightDisplayProps> = ({
  visible,
  onHeightUpdate,
}) => {
  const [height, setHeight] = useState<number>(0);
  const [isReceiving, setIsReceiving] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const glowAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (!visible) return;

    const bleService = BLEService;

    // Listen to height updates
    const handleHeight = (heightValue: number) => {
      setHeight(heightValue);
      setIsReceiving(true);
      onHeightUpdate?.(heightValue);

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }).start();
      });
    };

    bleService.on('height', handleHeight);

    return () => {
      bleService.off('height', handleHeight);
    };
  }, [visible]);

  if (!visible || !isReceiving) return null;

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.status.success],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={[colors.tertiary.container, colors.tertiary.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={[styles.glowRing, { shadowColor: glowColor }]}>
            <View style={styles.content}>
              <Text style={styles.label}>📏 Tinggi Real-Time</Text>
              <Text style={styles.value}>{height.toFixed(1)}</Text>
              <Text style={styles.unit}>cm</Text>
              <View style={styles.indicator}>
                <View style={styles.dot} />
                <Text style={styles.indicatorText}>LIVE</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: spacing.md,
    zIndex: 1000,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  blurContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.effects.glassBlur,
  },
  gradient: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    opacity: 0.95,
  },
  glowRing: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    borderRadius: borderRadius.lg,
  },
  content: {
    alignItems: 'center',
    minWidth: 120,
  },
  label: {
    ...typography.styles.labelCaps,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  value: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text.inverse,
    letterSpacing: -1,
  },
  unit: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.element,
    paddingHorizontal: spacing.element,
    paddingVertical: spacing.xs,
    backgroundColor: colors.effects.glassWhite,
    borderRadius: borderRadius.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.status.success,
    marginRight: 6,
  },
  indicatorText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
});

export default RealTimeHeightDisplay;
