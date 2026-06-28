/**
 * Live Measurement Modal - Fullscreen Neu-Glassmorphism Design
 * Real-time Height/Weight display with smooth animations and pink glow effects
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import MQTTService from '../../services/MQTTService';
const mqttService = MQTTService.getInstance();
// import { useDarkMode } from '../../hooks/useDarkMode';
const { isDarkMode } = { isDarkMode: false }; // Temporary fix

const { width, height } = Dimensions.get('window');

interface LiveMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onMeasurementComplete?: (data: { weight: number; height: number }) => void;
}

export default function LiveMeasurementModal({
  visible,
  onClose,
  onMeasurementComplete,
}: LiveMeasurementModalProps) {
  const { isDarkMode } = { isDarkMode: false }; // Temporary fix
  const [liveWeight, setLiveWeight] = useState(0);
  const [liveHeight, setLiveHeight] = useState(0);
  const [isReceivingData, setIsReceivingData] = useState(false);

  // Animation values
  const weightAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const glowAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (visible) {
      // Start listening to live MQTT data
      const unsubscribe = mqttService.subscribeMeasurements((data) => {
        if (data.weight_kg || data.height_cm) {
          setIsReceivingData(true);
          
          if (data.weight_kg && data.weight_kg !== liveWeight) {
            setLiveWeight(data.weight_kg);
            animateNewData(weightAnim);
          }
          
          if (data.height_cm && data.height_cm !== liveHeight) {
            setLiveHeight(data.height_cm);
            animateNewData(heightAnim);
          }
        }
      });

      // Start pulse animation
      startPulseAnimation();

      return () => {
        unsubscribe();
      };
    }
  }, [visible, liveWeight, liveHeight]);

  const animateNewData = (animValue: Animated.Value) => {
    // Pink glow effect for new data - optimized for 60fps
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Rolling number animation - optimized
    Animated.spring(animValue, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      animValue.setValue(0);
    });
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleDone = () => {
    if (onMeasurementComplete && (liveWeight > 0 || liveHeight > 0)) {
      onMeasurementComplete({
        weight: liveWeight,
        height: liveHeight,
      });
    }
    onClose();
  };

  const glowStyle = {
    shadowColor: colors.pink.main,
    shadowOpacity: glowAnim,
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <BlurView
        intensity={isDarkMode ? 70 : 50}
        tint={isDarkMode ? 'dark' : 'light'}
        style={styles.modalContainer}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? 'rgba(33, 37, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              📏 Pengukuran Live
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Live Data Display */}
          <View style={styles.dataContainer}>
            {/* Weight Card */}
            <Animated.View
              style={[
                styles.measurementCard,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 105, 180, 0.1)',
                  transform: [
                    { scale: pulseAnim },
                    { 
                      translateY: weightAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      })
                    }
                  ]
                },
                glowStyle,
              ]}
            >
              <Text style={styles.measurementIcon}>⚖️</Text>
              <Text style={[
                styles.measurementLabel,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Berat Badan
              </Text>
              <Text style={[
                styles.measurementValue,
                { color: isDarkMode ? colors.pink.main : colors.pink.main }
              ]}>
                {liveWeight > 0 ? `${liveWeight.toFixed(1)} kg` : '-- kg'}
              </Text>
            </Animated.View>

            {/* Height Card */}
            <Animated.View
              style={[
                styles.measurementCard,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 105, 180, 0.1)',
                  transform: [
                    { scale: pulseAnim },
                    { 
                      translateY: heightAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      })
                    }
                  ]
                },
                glowStyle,
              ]}
            >
              <Text style={styles.measurementIcon}>📏</Text>
              <Text style={[
                styles.measurementLabel,
                { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
              ]}>
                Tinggi Saat Ini
              </Text>
              <Text style={[
                styles.currentValue,
                { color: isDarkMode ? colors.pink[300] : colors.pink.main }
              ]}>
                {liveHeight > 0 ? `${liveHeight.toFixed(1)} cm` : '-- cm'}
              </Text>
            </Animated.View>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isReceivingData ? '#4CAF50' : '#FFC107' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              {isReceivingData ? '📡 Menerima data real-time' : '⏳ Menunggu data...'}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={[
              styles.instructionsTitle,
              { color: isDarkMode ? '#FFFFFF' : colors.text.primary }
            ]}>
              Instruksi:
            </Text>
            <Text style={[
              styles.instructionsText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Pastikan anak berdiri stabil di timbangan
            </Text>
            <Text style={[
              styles.instructionsText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Tunggu hingga angka stabil
            </Text>
            <Text style={[
              styles.instructionsText,
              { color: isDarkMode ? '#FFFFFF' : colors.text.secondary }
            ]}>
              • Tap "Selesai" untuk menyimpan hasil
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { 
                  opacity: (liveWeight > 0 || liveHeight > 0) ? 1 : 0.6,
                  backgroundColor: isDarkMode ? colors.pink[400] : colors.pink.main 
                }
              ]}
              onPress={handleDone}
              disabled={liveWeight === 0 && liveHeight === 0}
            >
              <Text style={styles.primaryButtonText}>✅ Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.standard,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  dataContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  measurementCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.soft,
  },
  measurementIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  measurementLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
    marginBottom: spacing.xs,
  },
  measurementValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold as any,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
  },
  instructionsContainer: {
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.standard,
  },
  primaryButton: {
    backgroundColor: colors.pink.main,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.pink.main,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.pink.main,
  },
});