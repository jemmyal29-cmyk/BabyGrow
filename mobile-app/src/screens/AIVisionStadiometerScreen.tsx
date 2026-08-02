/**
 * AI Vision Stadiometer — camera + Gemini multimodal → Supabase measurement
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import GeminiAIService from '../services/GeminiAIService';
import MeasurementSyncService from '../services/MeasurementSyncService';
import HapticService from '../services/HapticService';
import { useChildStore } from '../store/childStore';
import { getStuntingDisplay } from '../hooks/useMeasurements';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ScreenHeader } from '../components/common';

const { width, height } = Dimensions.get('window');

export default function AIVisionStadiometerScreen({ navigation }: any) {
  const activeChild = useChildStore((s) => s.activeChild);
  const [permission, setPermission] = useState<{
    status: string;
    granted: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detectedHeight, setDetectedHeight] = useState<number | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState<string>('');
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(
    null
  );
  const cameraRef = useRef<CameraView>(null);
  const syncService = React.useMemo(
    () => MeasurementSyncService.getInstance(),
    []
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setPermission({ status, granted: status === 'granted' });
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission({ status, granted: status === 'granted' });
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isProcessing) return;

    if (!activeChild) {
      Alert.alert(
        'Pilih Anak',
        'Pilih anak aktif di Beranda sebelum mengukur dengan AI Vision.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Pilih Anak',
            onPress: () => navigation.navigate('Children'),
          },
        ]
      );
      return;
    }

    if (!GeminiAIService.isConfigured()) {
      Alert.alert(
        'Kamera AI Belum Siap',
        'Fitur ini membutuhkan koneksi internet dan kunci AI yang sudah diatur petugas teknis. Sementara itu, gunakan Ukur Manual atau alat pintar.'
      );
      return;
    }

    setIsProcessing(true);
    setDetectedHeight(null);
    setAnalysisNotes('');
    setConfidence(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        throw new Error('Gagal mengambil foto');
      }

      const mimeType =
        photo.uri?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

      const result = await GeminiAIService.estimateToddlerHeightFromImage(
        photo.base64,
        mimeType
      );

      setDetectedHeight(result.height_cm);
      setAnalysisNotes(result.notes);
      setConfidence(result.confidence);
      await HapticService.success();

      Alert.alert(
        'Tinggi Terdeteksi',
        [
          `Anak: ${activeChild.name}`,
          `Estimasi: ${result.height_cm} cm`,
          `Keyakinan: ${result.confidence}`,
          result.notes ? `Catatan: ${result.notes}` : '',
          '',
          'Simpan hasil ini sebagai pengukuran anak?',
        ]
          .filter(Boolean)
          .join('\n'),
        [
          {
            text: 'Ulang',
            style: 'cancel',
            onPress: () => {
              setDetectedHeight(null);
              setAnalysisNotes('');
              setConfidence(null);
            },
          },
          {
            text: 'Simpan',
            onPress: () => {
              void saveHeight(result.height_cm);
            },
          },
        ]
      );
    } catch (error: unknown) {
      await HapticService.error();
      const message =
        error instanceof Error ? error.message : 'Gagal menganalisis foto';
      Alert.alert('Analisis Gagal', message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveHeight = async (heightCm: number) => {
    if (!activeChild) return;
    setIsSaving(true);
    try {
      const row = await syncService.syncToSupabase({
        child_id: activeChild.id,
        height_cm: heightCm,
        weight_kg: null,
        source: 'ai_vision',
        gender: activeChild.gender,
        date_of_birth: activeChild.date_of_birth,
        measured_at: new Date().toISOString(),
        device_id: 'gemini-vision',
      });

      if (row) {
        const stunting = getStuntingDisplay({
          stunting_risk: row.stunting_risk,
          z_score_hfa: row.z_score_hfa,
        });
        await HapticService.success();
        Alert.alert(
          'Tersimpan',
          [
            `Tinggi: ${row.height_cm.toFixed(1)} cm`,
            `Z-Score TB/U: ${row.z_score_hfa != null ? row.z_score_hfa.toFixed(2) : '—'}`,
            `Status: ${stunting?.label ?? '—'}`,
            '',
            'Sumber: Kamera AI Vision',
          ].join('\n'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        await HapticService.medium();
        Alert.alert(
          'Disimpan Offline',
          'Pengukuran AI Vision masuk antrian sync dan akan dikirim saat online.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: unknown) {
      await HapticService.error();
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan pengukuran';
      Alert.alert('Gagal Menyimpan', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionContainer} edges={['bottom']}>
        <ScreenHeader
          title="AI Vision"
          subtitle="Stadiometer"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.permissionBody}>
          <ActivityIndicator color={colors.primary.main} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer} edges={['bottom']}>
        <ScreenHeader
          title="AI Vision"
          subtitle="Stadiometer"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.permissionBody}>
          <MaterialCommunityIcons
            name="camera-off"
            size={48}
            color={colors.primary.main}
          />
          <Text style={styles.permissionText}>Memerlukan izin kamera</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionButtonText}>Berikan Izin</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <Svg height={height} width={width} style={styles.overlay}>
          <Line
            x1={width / 2}
            y1={0}
            x2={width / 2}
            y2={height}
            stroke={colors.effects.primaryGlow}
            strokeWidth="2"
            strokeDasharray="10, 5"
          />
          <Rect
            x={width / 2 - 100}
            y={height / 2 - 200}
            width={200}
            height={400}
            stroke={colors.primary.main}
            strokeWidth="3"
            fill="none"
            strokeDasharray="15, 10"
          />
          <Circle cx={width / 2} cy={height / 2 - 200} r="8" fill={colors.primary.main} />
          <Line
            x1={width / 2 - 60}
            y1={height / 2 - 200}
            x2={width / 2 + 60}
            y2={height / 2 - 200}
            stroke={colors.primary.main}
            strokeWidth="3"
          />
          <Circle cx={width / 2} cy={height / 2 + 200} r="8" fill={colors.primary.main} />
          <Line
            x1={width / 2 - 60}
            y1={height / 2 + 200}
            x2={width / 2 + 60}
            y2={height / 2 + 200}
            stroke={colors.primary.main}
            strokeWidth="3"
          />
        </Svg>

        <LinearGradient
          colors={[colors.neutral.black, 'transparent']}
          style={styles.topOverlay}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>AI Vision Stadiometer</Text>
            <Text style={styles.instructionsText}>
              {activeChild
                ? `Anak: ${activeChild.name}`
                : 'Pilih anak aktif terlebih dahulu'}
            </Text>
            <Text style={styles.instructionsSubtext}>
              • Berdiri tegak, kepala sampai kaki terlihat{'\n'}
              • Ambil foto jelas — AI mengestimasi tinggi{'\n'}
              • Hasil bantu skrining; ukur ulang dengan alat bila perlu
            </Text>
          </Animated.View>
        </LinearGradient>

        {detectedHeight != null && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultOverlay}>
            <LinearGradient
              colors={[colors.primary.main, colors.primary.container]}
              style={styles.resultCard}
            >
              <Text style={styles.resultLabel}>Tinggi Terdeteksi</Text>
              <Text style={styles.resultValue}>{detectedHeight} cm</Text>
              {confidence ? (
                <Text style={styles.resultSubtext}>Keyakinan: {confidence}</Text>
              ) : null}
              {analysisNotes ? (
                <Text style={styles.resultNotes} numberOfLines={3}>
                  {analysisNotes}
                </Text>
              ) : null}
            </LinearGradient>
          </Animated.View>
        )}

        <LinearGradient
          colors={['transparent', colors.neutral.black]}
          style={styles.bottomOverlay}
        >
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isProcessing || isSaving}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text.inverse}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                (isProcessing || isSaving) && styles.captureButtonDisabled,
              ]}
              onPress={captureAndAnalyze}
              disabled={isProcessing || isSaving}
            >
              <View style={styles.captureButtonInner}>
                {isProcessing || isSaving ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <MaterialCommunityIcons
                    name="camera"
                    size={28}
                    color={colors.text.inverse}
                  />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() =>
                Alert.alert(
                  'Tips AI Vision',
                  'Estimasi tinggi dari foto bersifat perkiraan. Untuk akurasi klinis gunakan alat ukur fisik / IoT. Hasil disimpan sebagai sumber ai_vision.'
                )
              }
            >
              <MaterialCommunityIcons
                name="help"
                size={24}
                color={colors.text.inverse}
              />
            </TouchableOpacity>
          </View>

          {(isProcessing || isSaving) && (
            <Animated.View entering={FadeIn} style={styles.processingOverlay}>
              <Text style={styles.processingLabel}>
                {isSaving ? 'Menyimpan hasil…' : 'Sedang menganalisis foto…'}
              </Text>
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
    backgroundColor: colors.neutral.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  permissionBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.section,
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionsTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    ...typography.styles.bodyMd,
    color: colors.text.inverse,
    marginBottom: spacing.element,
  },
  instructionsSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
    opacity: 0.85,
    lineHeight: typography.lineHeight.button,
    textAlign: 'center',
  },
  resultOverlay: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width / 2 - 120,
    width: 240,
  },
  resultCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.white,
    ...shadows.diffusion,
  },
  resultLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  resultValue: {
    ...typography.styles.displayLg,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  resultSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
  },
  resultNotes: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.section,
    paddingTop: spacing.section,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.effects.glassBlur,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary.main,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.effects.glassBlur,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  processingLabel: {
    ...typography.styles.buttonText,
    color: colors.text.inverse,
  },
  permissionText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.diffusion,
  },
  permissionButtonText: {
    ...typography.styles.buttonText,
    color: colors.text.inverse,
  },
});
