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
      setMessage('Mencari BabyGrow_Alat...');
    }
  }, [visible]);

  const startBLEPairing = async () => {
    try {
      const bleService = BLEService;
      
      // Step 1: Scan for devices
      setStatus('scanning');
      setMessage('Mencari perangkat Bluetooth...');
      HapticService.light();

      const devices = await bleService.scanForDevices(10);
      
      // Find BabyGrow_Alat
      const babyGrowDevice = devices.find(d => d.name === 'BabyGrow_Alat');
      
      if (!babyGrowDevice) {
        throw new Error('BabyGrow_Alat tidak ditemukan.\n\nPastikan:\n• ESP32 sudah dinyalakan\n• Bluetooth di HP aktif\n• ESP32 dalam mode pairing (LED berkedip)\n• Jarak < 10 meter\n• ESP32 memancarkan nama "BabyGrow_Alat"');
      }

      // Step 2: Connect to device
      setStatus('connecting');
      setMessage('Menghubungkan ke BabyGrow_Alat...');
      HapticService.light();

      bleService.on('connected', (info: any) => {
        HapticService.success();
        setStatus('success');
        setMessage('Terhubung! ✅');
        
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
            colors={['rgba(255, 105, 180, 0.95)', 'rgba(155, 89, 182, 0.90)']}
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
                <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 16 }} />
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
                <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 16 }} />
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
                    colors={['#4CAF50', '#66BB6A']}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width - 60,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalContent: {
    padding: 32,
  },
  contentCenter: {
    alignItems: 'center',
  },
  // WHITE TEXT VARIANTS (for gradient background)
  titleWhite: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitleWhite: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  // SCANNING STATE
  scanningCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scanningIcon: {
    fontSize: 64,
  },
  // CONNECTING STATE
  connectingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  connectingIcon: {
    fontSize: 64,
  },
  // GLASS INFO BOX
  infoBoxGlass: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoTextWhite: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  // SUCCESS STATE with GLOW
  successCircleGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  successIcon: {
    fontSize: 70,
  },
  successTitleWhite: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  successSubtitleWhite: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  deviceInfoBoxGlass: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  deviceInfoLabelWhite: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  deviceInfoTextWhite: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
  },
  // ERROR STATE with GLOW
  errorCircleGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  errorIcon: {
    fontSize: 70,
  },
  errorTitleWhite: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtitleWhite: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  errorHintWhite: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButtonGlass: {
    marginTop: 14,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonTextWhite: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PairingModal;
