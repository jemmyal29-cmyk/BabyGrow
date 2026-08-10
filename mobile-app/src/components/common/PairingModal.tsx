/**
 * BabyGrow 2026 - BLE Pairing Modal
 * 3D Glassmorphism with Real Bluetooth Connection
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import BLEService from '../../services/BLEService';
import HapticService from '../../services/HapticService';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface PairingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (deviceInfo: any) => void;
}

const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'scanning' | 'connecting' | 'success' | 'error'>('scanning');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [message, setMessage] = useState('Mencari BabyGrow_Alat...');

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation (for connecting state)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start BLE pairing process
      startBLEPairing();
    } else {
      // Reset
      scaleAnim.setValue(0.5);
      fadeAnim.setValue(0);
      successScale.setValue(0);
      setStatus('scanning');
      setDeviceInfo(null);
      setMessage('Mencari alat BabyGrow…');
    }
  }, [visible]);

  const startBLEPairing = async () => {
    try {
      const bleService = BLEService;
      
      // Step 1: Scan for devices
      setStatus('scanning');
      setMessage('Mencari alat BabyGrow di sekitar Anda…');
      HapticService.light();

      const devices = await bleService.scanForDevices(12);

      // Cari BabyGrow_Alat (nama exact / mengandung BabyGrow)
      const babyGrowDevice =
        devices.find((d) => d.name === 'BabyGrow_Alat') ||
        devices.find((d) =>
          (d.name || '').toLowerCase().includes('babygrow')
        );

      if (!babyGrowDevice) {
        throw new Error(
          'Alat belum ditemukan.\n\nPastikan:\n• ESP32 sudah di-flash firmware terbaru (BLE ON)\n• Serial Monitor: [BLE] Advertising ON — BabyGrow_Alat\n• Bluetooth HP aktif + izin lokasi\n• HP dekat alat (±2 m)\n\nAlternatif sidang: pakai Ukur Live (MQTT).'
        );
      }

      // Step 2: Connect to device
      setStatus('connecting');
      setMessage('Menghubungkan ke alat…');
      HapticService.light();

      bleService.on('connected', (info: any) => {
        HapticService.success();
        setStatus('success');
        setMessage('Berhasil terhubung!');
        
        const deviceDetails = {
          type: 'BLE',
          name: 'BabyGrow_Alat',
          deviceId: info.deviceId,
          batteryLevel: info.batteryLevel || 0,
          signalStrength: info.signalStrength || 0,
          status: 'online',
        };
        
        setDeviceInfo(deviceDetails);

        // Success animation
        Animated.spring(successScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }).start();

        // Auto-close after success
        setTimeout(() => {
          onSuccess(deviceDetails);
          onClose();
        }, 2500);
      });

      bleService.on('error', (error: any) => {
        HapticService.error();
        setStatus('error');
        setMessage(error.message || 'Koneksi gagal');
      });

      // Attempt connection
      await bleService.connectToDevice(babyGrowDevice.id);
      
    } catch (error: any) {
      console.error('BLE Pairing error:', error);
      HapticService.error();
      setStatus('error');
      setMessage(error.message || 'Tidak dapat terhubung ke alat.\n\nPastikan alat sudah dinyalakan dan Bluetooth aktif.');
    }
  };

  const handleRetry = () => {
    HapticService.light();
    setStatus('scanning');
    setMessage('Mencari BabyGrow_Alat...');
    successScale.setValue(0);
    startBLEPairing();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} tint="dark" style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary.container, colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {/* SCANNING STATE - NEW */}
            {status === 'scanning' && (
              <Animated.View 
                style={[
                  styles.contentCenter,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <View style={styles.scanningCircle}>
                  <Text style={styles.scanningIcon}>🔍</Text>
                </View>
                <ActivityIndicator size="large" color={colors.neutral.white} style={{ marginTop: spacing.md }} />
                <Text style={styles.titleWhite}>Mencari Perangkat</Text>
                <Text style={styles.subtitleWhite}>Sedang scan BabyGrow_Alat...</Text>
                <View style={styles.infoBoxGlass}>
                  <Text style={styles.infoTextWhite}>📡 Bluetooth Low Energy</Text>
                  <Text style={styles.infoTextWhite}>🔌 Radius: 10 meter</Text>
                  <Text style={styles.infoTextWhite}>⏱️ Timeout: 10 detik</Text>
                </View>
              </Animated.View>
            )}

            {/* CONNECTING STATE - UPDATED */}
            {status === 'connecting' && (
              <Animated.View 
                style={[
                  styles.contentCenter,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <View style={styles.connectingCircle}>
                  <Text style={styles.connectingIcon}>🔗</Text>
                </View>
                <ActivityIndicator size="large" color={colors.neutral.white} style={{ marginTop: spacing.md }} />
                <Text style={styles.titleWhite}>Menghubungkan</Text>
                <Text style={styles.subtitleWhite}>{message}</Text>
                <View style={styles.infoBoxGlass}>
                  <Text style={styles.infoTextWhite}>📱 Pairing dengan BabyGrow_Alat</Text>
                  <Text style={styles.infoTextWhite}>🔐 Bluetooth LE Secure</Text>
                </View>
              </Animated.View>
            )}

            {/* SUCCESS STATE - UPDATED FOR BLE */}
            {status === 'success' && (
              <Animated.View
                style={[
                  styles.contentCenter,
                  { transform: [{ scale: successScale }] },
                ]}
              >
                <View style={styles.successCircleGlow}>
                  <Text style={styles.successIcon}>✅</Text>
                </View>
                <Text style={styles.successTitleWhite}>Berhasil Terhubung!</Text>
                <Text style={styles.successSubtitleWhite}>Alat Terkoneksi via Bluetooth</Text>
                
                {deviceInfo && (
                  <View style={styles.deviceInfoBoxGlass}>
                    <Text style={styles.deviceInfoLabelWhite}>📟 Informasi Perangkat:</Text>
                    <Text style={styles.deviceInfoTextWhite}>🔗 {deviceInfo.name}</Text>
                    <Text style={styles.deviceInfoTextWhite}>🆔 {deviceInfo.deviceId}</Text>
                    <Text style={styles.deviceInfoTextWhite}>🔋 Battery: {deviceInfo.batteryLevel}%</Text>
                    <Text style={styles.deviceInfoTextWhite}>📶 Signal: {deviceInfo.signalStrength} dBm</Text>
                    <Text style={styles.deviceInfoTextWhite}>✅ {deviceInfo.status.toUpperCase()}</Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* ERROR STATE - UPDATED */}
            {status === 'error' && (
              <View style={styles.contentCenter}>
                <View style={styles.errorCircleGlow}>
                  <Text style={styles.errorIcon}>❌</Text>
                </View>
                <Text style={styles.errorTitleWhite}>Koneksi Gagal</Text>
                <Text style={styles.errorSubtitleWhite}>{message}</Text>
                <Text style={styles.errorHintWhite}>
                  Pastikan Bluetooth ON dan BabyGrow_Alat menyala
                </Text>
                
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                  <LinearGradient
                    colors={[colors.tertiary.container, colors.tertiary.main]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.retryButtonGradient}
                  >
                    <Text style={styles.retryButtonText}>🔄 Coba Lagi</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButtonGlass} onPress={onClose}>
                  <Text style={styles.cancelButtonTextWhite}>Batal</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.effects.shadowMedium,
  },
  modalContainer: {
    width: width - spacing.section * 1.5,
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  modalContent: {
    padding: spacing.xl,
  },
  contentCenter: {
    alignItems: 'center',
  },
  titleWhite: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.inverse,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitleWhite: {
    ...typography.styles.bodyMd,
    color: colors.primary.onContainer,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scanningCircle: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.effects.glassWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.effects.glassBlur,
  },
  scanningIcon: {
    fontSize: typography.fontSize.huge,
  },
  connectingCircle: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.effects.glassBlur,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.fixedDim,
  },
  connectingIcon: {
    fontSize: typography.fontSize.huge,
  },
  infoBoxGlass: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.effects.glassPink,
    borderRadius: borderRadius.md,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  infoTextWhite: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  successCircleGlow: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: spacing.element },
    shadowOpacity: 0.5,
    shadowRadius: spacing.xl,
    elevation: 12,
  },
  successIcon: {
    fontSize: typography.fontSize.huge,
  },
  successTitleWhite: {
    ...typography.styles.headlineLg,
    color: colors.text.inverse,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  successSubtitleWhite: {
    ...typography.styles.bodyMd,
    color: colors.primary.onContainer,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  deviceInfoBoxGlass: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.effects.glassWhite,
    borderRadius: borderRadius.md,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  deviceInfoLabelWhite: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  deviceInfoTextWhite: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.onContainer,
    marginBottom: spacing.xs,
  },
  errorCircleGlow: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: spacing.element },
    shadowOpacity: 0.5,
    shadowRadius: spacing.xl,
    elevation: 12,
  },
  errorIcon: {
    fontSize: typography.fontSize.huge,
  },
  errorTitleWhite: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.inverse,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorSubtitleWhite: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.onContainer,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorHintWhite: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.fixedDim,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeight.labelCaps,
  },
  retryButton: {
    marginTop: spacing.lg,
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.soft,
  },
  retryButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.styles.buttonText,
    color: colors.text.inverse,
  },
  cancelButtonGlass: {
    marginTop: spacing.element,
    width: '100%',
    paddingVertical: spacing.element,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.effects.glassPink,
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  cancelButtonTextWhite: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.inverse,
  },
});

export default PairingModal;
