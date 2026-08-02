/**
 * Hardware Health Widget
 * Shows IoT device connection status with visual feedback
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import HapticService from '../../services/HapticService';
import {colors, typography, spacing, borderRadius, shadows} from '../../theme';

interface HardwareHealthWidgetProps {
  isConnected: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  onRetryConnect?: () => void;
}

export function HardwareHealthWidget({
  isConnected,
  batteryLevel = 0,
  signalStrength = 0,
  onRetryConnect,
}: HardwareHealthWidgetProps) {
  const glowAnimation = useSharedValue(0);
  const pressScale = useSharedValue(1);

  React.useEffect(() => {
    if (isConnected) {
      // Glow pink animation when connected
      glowAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      glowAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isConnected]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
    transform: [{ scale: 1 + glowAnimation.value * 0.1 }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = async () => {
    await HapticService.buttonPress();
    pressScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getSignalIcon = () => {
    if (signalStrength >= -50) return '📶';
    if (signalStrength >= -70) return '📶';
    if (signalStrength >= -80) return '📶';
    return '📵';
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={!isConnected ? onRetryConnect : undefined}
      style={styles.container}
    >
      <Animated.View style={[styles.wrapper, pressStyle]}>
        {/* Glow Effect for Connected State */}
        {isConnected && (
          <Animated.View style={[styles.glowRing, glowStyle]}>
            <View style={styles.glowInner} />
          </Animated.View>
        )}

        <BlurView 
          intensity={isConnected ? 80 : 40} 
          tint={isConnected ? "light" : "dark"} 
          style={styles.blurContainer}
        >
          <View style={[
            styles.content,
            { backgroundColor: isConnected ? colors.effects.glassPink : colors.effects.shadowLight }
          ]}>
            {/* Status Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{isConnected ? '🔌' : '🔌'}</Text>
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? colors.status.success : colors.neutral.gray400 }
              ]} />
            </View>

            {/* Connection Status */}
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText,
                { color: isConnected ? colors.primary.main : colors.neutral.gray500 }
              ]}>
                {isConnected ? 'Online' : 'Offline'}
              </Text>
              
              {isConnected && (
                <View style={styles.details}>
                  {batteryLevel > 0 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>🔋</Text>
                      <Text style={styles.detailText}>{batteryLevel}%</Text>
                    </View>
                  )}
                  {signalStrength !== 0 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>{getSignalIcon()}</Text>
                      <Text style={styles.detailText}>{signalStrength}dBm</Text>
                    </View>
                  )}
                </View>
              )}

              {!isConnected && onRetryConnect && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={async () => {
                    await HapticService.buttonPress();
                    onRetryConnect();
                  }}
                >
                  <Text style={styles.retryText}>🔄 Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    zIndex: 1000,
  },
  wrapper: {
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.effects.primaryGlow,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  glowInner: {
    flex: 1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.effects.glassPink,
  },
  blurContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.effects.glassBlur,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.element,
    gap: 10,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: typography.fontSize.xl,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  statusContainer: {
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailIcon: {
    fontSize: typography.fontSize.xs,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray500,
  },
  retryButton: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.effects.glassPink,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  retryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
  },
});
