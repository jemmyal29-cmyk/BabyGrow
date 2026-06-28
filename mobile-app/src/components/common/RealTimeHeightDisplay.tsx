/**
 * Real-Time Height Display Component
 * Shows live height data from BLE device
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import BLEService from '../../services/BLEService';

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
    outputRange: ['rgba(76, 175, 80, 0)', 'rgba(76, 175, 80, 0.6)'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.3)']}
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
    right: 16,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gradient: {
    padding: 16,
    borderRadius: 20,
  },
  glowRing: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
    minWidth: 120,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default RealTimeHeightDisplay;
