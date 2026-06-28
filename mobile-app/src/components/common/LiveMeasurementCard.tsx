/**
 * Live Measurement Card with Animated Numbers
 * Real-time sensor data display with smooth rolling numbers animation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface LiveMeasurementCardProps {
  height: number;
  weight?: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isConnected: boolean;
}

export function LiveMeasurementCard({ 
  height, 
  weight, 
  quality, 
  isConnected 
}: LiveMeasurementCardProps) {
  const heightValue = useSharedValue(0);
  const [displayHeight, setDisplayHeight] = useState(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isConnected && height > 0) {
      // Animated height number
      heightValue.value = withSpring(height, {
        damping: 15,
        stiffness: 100,
      });

      // Update display with smooth transition
      const interval = setInterval(() => {
        setDisplayHeight(prev => {
          const diff = height - prev;
          if (Math.abs(diff) < 0.1) return height;
          return prev + diff * 0.15;
        });
      }, 50);

      // Glow effect when data received
      glowOpacity.value = withTiming(1, { duration: 300 }, () => {
        glowOpacity.value = withTiming(0, { duration: 1000 });
      });

      return () => clearInterval(interval);
    }
  }, [height, isConnected]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'poor': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'excellent': return 'Sangat Baik';
      case 'good': return 'Baik';
      case 'fair': return 'Cukup';
      case 'poor': return 'Kurang';
      default: return 'Tidak Diketahui';
    }
  };

  return (
    <View style={styles.container}>
      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={['rgba(255, 105, 180, 0.4)', 'rgba(255, 105, 180, 0)']}
          style={styles.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <BlurView intensity={50} tint="light" style={styles.blurCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 182, 193, 0.3)']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📡</Text>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#9E9E9E' }]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Live Sensor</Text>
              <Text style={styles.subtitle}>
                {isConnected ? 'Terhubung' : 'Tidak Terhubung'}
              </Text>
            </View>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor() }]}>
              <Text style={styles.qualityText}>{getQualityText()}</Text>
            </View>
          </View>

          {/* Main Display */}
          <View style={styles.mainDisplay}>
            <View style={styles.measurement}>
              <Text style={styles.label}>Tinggi Badan</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>
                  {displayHeight.toFixed(1)}
                </Text>
                <Text style={styles.unit}>cm</Text>
              </View>
              <View style={styles.indicator}>
                <View style={[styles.indicatorBar, { width: `${Math.min(height / 1.2, 100)}%` }]} />
              </View>
            </View>

            {weight !== undefined && weight > 0 && (
              <View style={styles.measurement}>
                <Text style={styles.label}>Berat Badan</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{weight.toFixed(1)}</Text>
                  <Text style={styles.unit}>kg</Text>
                </View>
              </View>
            )}
          </View>

          {/* Device Info */}
          <View style={styles.footer}>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceIcon}>🔧</Text>
              <Text style={styles.deviceText}>ESP32 VL53L0X</Text>
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>
                {new Date().toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
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
    borderRadius: 30,
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.3)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
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
    borderColor: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainDisplay: {
    marginBottom: 16,
  },
  measurement: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FF69B4',
    letterSpacing: -2,
  },
  unit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF69B4',
    marginLeft: 8,
  },
  indicator: {
    height: 6,
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  indicatorBar: {
    height: '100%',
    backgroundColor: '#FF69B4',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  deviceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  timestampContainer: {
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF69B4',
  },
});
