/**
 * PairingPopup3D.tsx
 * 3D Pop-up Modal untuk BLE Pairing dengan Checklist Glowing
 * 2026 Standard
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import BLEService, { DeviceInfo } from '../../services/BLEService';

const { width, height } = Dimensions.get('window');

/**
 * ═══════════════════════════════════════════════════════
 * PROPS INTERFACE
 * ═══════════════════════════════════════════════════════
 */
interface PairingPopup3DProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (deviceInfo: DeviceInfo) => void;
}

/**
 * ═══════════════════════════════════════════════════════
 * PAIRING STATES
 * ═══════════════════════════════════════════════════════
 */
type PairingState = 'scanning' | 'connecting' | 'success' | 'error';

/**
 * ═══════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════
 */
const PairingPopup3D: React.FC<PairingPopup3DProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  // ═════ STATE ═════
  const [pairingState, setPairingState] = useState<PairingState>('scanning');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ═════ ANIMATIONS ═════
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [checkmarkScale] = useState(new Animated.Value(0));

  /**
   * ═══════════════════════════════════════════════════════
   * START PAIRING PROCESS
   * ═══════════════════════════════════════════════════════
   */
  useEffect(() => {
    if (visible) {
      startPairingProcess();
      startEntryAnimation();
    } else {
      resetState();
    }
  }, [visible]);

  const startPairingProcess = async () => {
    try {
      // Step 1: Scan for devices
      setPairingState('scanning');
      console.log('[PairingPopup] 🔍 Scanning...');

      const devices = await BLEService.scanForDevices(10);

      if (devices.length === 0) {
        throw new Error('Tidak ditemukan perangkat BabyGrow_Alat');
      }

      // Find BabyGrow device
      const targetDevice = devices.find((d) => d.name.includes('BabyGrow'));
      if (!targetDevice) {
        throw new Error('Perangkat BabyGrow_Alat tidak ditemukan');
      }

      // Step 2: Connect to device
      setPairingState('connecting');
      console.log('[PairingPopup] 🔗 Connecting...');

      // Listen for connection success
      const handleConnected = (info: DeviceInfo) => {
        console.log('[PairingPopup] ✅ Connected:', info);
        setDeviceInfo(info);
        setPairingState('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animate checkmark
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }).start();

        // Auto-close after 3 seconds
        setTimeout(() => {
          onSuccess(info);
          onClose();
        }, 3000);

        // Remove listener
        BLEService.off('connected', handleConnected);
      };

      BLEService.on('connected', handleConnected);

      await BLEService.connectToDevice(targetDevice.id);
    } catch (error: any) {
      console.error('[PairingPopup] ❌ Error:', error);
      setErrorMessage(error.message || 'Gagal menghubungkan perangkat');
      setPairingState('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  /**
   * ═══════════════════════════════════════════════════════
   * ANIMATIONS
   * ═══════════════════════════════════════════════════════
   */
  const startEntryAnimation = () => {
    // Scale entry
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Rotate animation (continuous for loading)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const resetState = () => {
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    glowAnim.setValue(0);
    checkmarkScale.setValue(0);
    setPairingState('scanning');
    setDeviceInfo(null);
    setErrorMessage('');
  };

  /**
   * ═══════════════════════════════════════════════════════
   * INTERPOLATIONS
   * ═══════════════════════════════════════════════════════
   */
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  /**
   * ═══════════════════════════════════════════════════════
   * RENDER CONTENT
   * ═══════════════════════════════════════════════════════
   */
  const renderContent = () => {
    switch (pairingState) {
      case 'scanning':
        return (
          <View style={styles.contentContainer}>
            {/* Animated Loading Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ rotate: rotation }] },
              ]}
            >
              <LinearGradient
                colors={['#FF69B4', '#F06292', '#FF69B4']}
                style={styles.iconGradient}
              >
                <Text style={styles.iconEmoji}>📡</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.statusText}>Mencari Perangkat...</Text>
            <Text style={styles.subText}>BabyGrow_Alat</Text>

            <ActivityIndicator
              size="large"
              color="#FF69B4"
              style={styles.spinner}
            />
          </View>
        );

      case 'connecting':
        return (
          <View style={styles.contentContainer}>
            {/* Animated Loading Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ rotate: rotation }] },
              ]}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D', '#4ECDC4']}
                style={styles.iconGradient}
              >
                <Text style={styles.iconEmoji}>🔗</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.statusText}>Menghubungkan...</Text>
            <Text style={styles.subText}>Tunggu sebentar</Text>

            <ActivityIndicator
              size="large"
              color="#4ECDC4"
              style={styles.spinner}
            />
          </View>
        );

      case 'success':
        return (
          <View style={styles.contentContainer}>
            {/* Success Checkmark with Glow */}
            <Animated.View
              style={[
                styles.successGlowCircle,
                { opacity: glowOpacity },
              ]}
            />

            <Animated.View
              style={[
                styles.successCheckContainer,
                { transform: [{ scale: checkmarkScale }] },
              ]}
            >
              <LinearGradient
                colors={['#4CAF50', '#81C784', '#4CAF50']}
                style={styles.successCheckGradient}
              >
                <Text style={styles.successCheckmark}>✓</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.successText}>Alat Terkoneksi!</Text>
            <Text style={styles.successSubText}>BLE Connection Established</Text>

            {/* Device Info Card */}
            {deviceInfo && (
              <BlurView intensity={100} tint="light" style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📱 Nama:</Text>
                  <Text style={styles.infoValue}>{deviceInfo.name}</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🔋 Baterai:</Text>
                  <Text style={styles.infoValue}>{deviceInfo.batteryLevel}%</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📡 Sinyal:</Text>
                  <Text style={styles.infoValue}>
                    {Math.abs(deviceInfo.signalStrength)} dBm
                  </Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🔗 Tipe:</Text>
                  <Text style={styles.infoValue}>{deviceInfo.type}</Text>
                </View>
              </BlurView>
            )}
          </View>
        );

      case 'error':
        return (
          <View style={styles.contentContainer}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#F44336', '#EF5350', '#F44336']}
                style={styles.iconGradient}
              >
                <Text style={styles.iconEmoji}>❌</Text>
              </LinearGradient>
            </View>

            <Text style={styles.errorText}>Koneksi Gagal</Text>
            <Text style={styles.errorSubText}>{errorMessage}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startPairingProcess();
              }}
            >
              <LinearGradient
                colors={['#FF69B4', '#F06292']}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>🔄 Coba Lagi</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
    }
  };

  /**
   * ═══════════════════════════════════════════════════════
   * RENDER MODAL
   * ═══════════════════════════════════════════════════════
   */
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurBackground}>
          <Animated.View
            style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}
          >
            <LinearGradient
              colors={['#2D2D2D', '#1A1A1A']}
              style={styles.popupGradient}
            >
              {/* Close Button (only show on error or success) */}
              {(pairingState === 'error' || pairingState === 'success') && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onClose();
                  }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}

              {/* Content */}
              {renderContent()}
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

/**
 * ═══════════════════════════════════════════════════════
 * STYLES
 * ═══════════════════════════════════════════════════════
 */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  popupGradient: {
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    alignItems: 'center',
  },

  // ═════ ICON STYLES ═════
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  iconEmoji: {
    fontSize: 56,
  },

  // ═════ TEXT STYLES ═════
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },

  // ═════ SUCCESS STYLES ═════
  successGlowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4CAF50',
    top: 0,
  },
  successCheckContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  successCheckGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
  },
  successCheckmark: {
    fontSize: 72,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubText: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 24,
  },

  // ═════ INFO CARD STYLES ═════
  infoCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },

  // ═════ ERROR STYLES ═════
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#EF9A9A',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 16,
  },
  retryButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default PairingPopup3D;
