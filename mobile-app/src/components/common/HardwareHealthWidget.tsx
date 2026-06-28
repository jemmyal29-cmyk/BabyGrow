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
            { backgroundColor: isConnected ? 'rgba(255, 105, 180, 0.15)' : 'rgba(158, 158, 158, 0.15)' }
          ]}>
            {/* Status Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{isConnected ? '🔌' : '🔌'}</Text>
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? '#4CAF50' : '#9E9E9E' }
              ]} />
            </View>

            {/* Connection Status */}
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText,
                { color: isConnected ? '#FF69B4' : '#757575' }
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
    right: 16,
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  glowInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusContainer: {
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  details: {
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailIcon: {
    fontSize: 10,
  },
  detailText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#757575',
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.3)',
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF69B4',
  },
});
