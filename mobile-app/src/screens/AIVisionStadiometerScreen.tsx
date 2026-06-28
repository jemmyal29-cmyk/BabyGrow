/**
 * AI Vision Stadiometer Screen
 * Camera with AR SVG Overlay + Gemini Vision API
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function AIVisionStadiometerScreen({ navigation }: any) {
  const [permission, setPermission] = React.useState<any>(null);
  const [requesting, setRequesting] = React.useState(false);

  const requestPermission = async () => {
    setRequesting(true);
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission({ status, granted: status === 'granted' });
    setRequesting(false);
  };

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setPermission({ status, granted: status === 'granted' });
    })();
  }, []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedHeight, setDetectedHeight] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Memerlukan izin kamera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Berikan Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo || !photo.base64) {
        throw new Error('Gagal mengambil foto');
      }

      // Mock Gemini Vision Analysis
      // TODO: Replace with actual Gemini API call
      const mockHeight = await mockGeminiAnalyze(photo.base64);
      
      setDetectedHeight(mockHeight);
      Alert.alert(
        'Tinggi Terdeteksi',
        `Tinggi anak: ${mockHeight} cm\n\nApakah hasil ini sudah benar?`,
        [
          { text: 'Ulang', style: 'cancel', onPress: () => setDetectedHeight(null) },
          { text: 'Simpan', onPress: () => saveHeight(mockHeight) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal menganalisis foto. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const mockGeminiAnalyze = async (base64Image: string): Promise<number> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock detection: Random height between 60-100 cm
    return Math.floor(Math.random() * (100 - 60 + 1)) + 60;
  };

  const saveHeight = (height: number) => {
    // TODO: Save to measurement store
    Alert.alert('Berhasil', `Tinggi ${height} cm disimpan!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* AR Overlay - Guide Lines */}
        <Svg height={height} width={width} style={styles.overlay}>
          {/* Vertical Center Line */}
          <Line
            x1={width / 2}
            y1={0}
            x2={width / 2}
            y2={height}
            stroke="rgba(255, 105, 180, 0.6)"
            strokeWidth="2"
            strokeDasharray="10, 5"
          />

          {/* Height Guide Rectangle */}
          <Rect
            x={width / 2 - 100}
            y={height / 2 - 200}
            width={200}
            height={400}
            stroke="#FF69B4"
            strokeWidth="3"
            fill="none"
            strokeDasharray="15, 10"
          />

          {/* Top Marker */}
          <Circle
            cx={width / 2}
            cy={height / 2 - 200}
            r="8"
            fill="#FF69B4"
          />
          <Line
            x1={width / 2 - 60}
            y1={height / 2 - 200}
            x2={width / 2 + 60}
            y2={height / 2 - 200}
            stroke="#FF69B4"
            strokeWidth="3"
          />

          {/* Bottom Marker */}
          <Circle
            cx={width / 2}
            cy={height / 2 + 200}
            r="8"
            fill="#FF69B4"
          />
          <Line
            x1={width / 2 - 60}
            y1={height / 2 + 200}
            x2={width / 2 + 60}
            y2={height / 2 + 200}
            stroke="#FF69B4"
            strokeWidth="3"
          />
        </Svg>

        {/* Instructions Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.topOverlay}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>AI Vision Stadiometer</Text>
            <Text style={styles.instructionsText}>
              Posisikan anak di dalam kotak panduan
            </Text>
            <Text style={styles.instructionsSubtext}>
              • Pastikan pencahayaan cukup{'\n'}
              • Anak berdiri tegak{'\n'}
              • Kepala dan kaki terlihat jelas
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Result Overlay */}
        {detectedHeight && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultOverlay}>
            <LinearGradient
              colors={['rgba(255, 105, 180, 0.95)', 'rgba(255, 182, 193, 0.95)']}
              style={styles.resultCard}
            >
              <Text style={styles.resultLabel}>Tinggi Terdeteksi</Text>
              <Text style={styles.resultValue}>{detectedHeight} cm</Text>
              <Text style={styles.resultSubtext}>🤖 Dianalisis dengan Gemini AI</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomOverlay}
        >
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={captureAndAnalyze}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner}>
                {isProcessing ? (
                  <Text style={styles.processingText}>⏳</Text>
                ) : (
                  <Text style={styles.captureText}>📸</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <Animated.View entering={FadeIn} style={styles.processingOverlay}>
              <Text style={styles.processingLabel}>Menganalisis dengan AI...</Text>
            </Animated.View>
          )}
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  resultOverlay: {
    position: 'absolute',
    top: height / 2 - 80,
    left: width / 2 - 120,
    width: 240,
  },
  resultCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF69B4',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 32,
  },
  processingText: {
    fontSize: 32,
  },
  helpButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  processingOverlay: {
    marginTop: 16,
    alignItems: 'center',
  },
  processingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  permissionText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
