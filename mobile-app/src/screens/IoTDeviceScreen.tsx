/**
 * IoT Device Screen - Sinkronisasi Perangkat IoT
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {colors, typography, spacing, borderRadius, shadows} from '../theme';
import { CommonActions } from '@react-navigation/native';

export default function IoTDeviceScreen({ navigation }: any) {
  const handleNavigateToChildren = () => {
    // Navigate back to MainTabs and then to Children tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              routes: [
                { name: 'Home' },
                { name: 'Children' },
                { name: 'Growth' },
                { name: 'Profile' },
              ],
              index: 1, // Children tab
            },
          },
        ],
      })
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IoT Device</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>⚙️</Text>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Sinkronisasi Sedang Ditingkatkan</Text>
            <Text style={styles.statusDesc}>
              Fitur ukur otomatis sedang dalam tahap pengembangan untuk memberikan akurasi terbaik
            </Text>
          </View>
        </View>

        {/* Manual Input Button - Prominent */}
        <TouchableOpacity 
          style={styles.manualInputButton}
          onPress={handleNavigateToChildren}
          activeOpacity={0.7}
        >
          <Text style={styles.manualInputIcon}>✏️</Text>
          <View style={styles.manualInputContent}>
            <Text style={styles.manualInputTitle}>Input Manual</Text>
            <Text style={styles.manualInputDesc}>Masukkan data berat & tinggi secara manual</Text>
          </View>
          <Text style={styles.manualInputArrow}>→</Text>
        </TouchableOpacity>

        {/* Temporary Solution Card */}
        <View style={styles.solutionCard}>
          <Text style={styles.sectionTitle}>💡 Panduan Input Manual</Text>
          <Text style={styles.solutionText}>
            Langkah-langkah menggunakan input manual:
          </Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Klik menu <Text style={styles.bold}>"Anak"</Text> di navigation bawah
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Pilih anak yang akan diukur
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Klik tombol <Text style={styles.bold}>"Edit"</Text> atau <Text style={styles.bold}>"Ukur Sekarang"</Text>
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Masukkan Berat Badan (BB) dan Tinggi Badan (TB) secara manual
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Klik <Text style={styles.bold}>"Simpan"</Text> untuk menjalankan analisis AI
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNavigateToChildren}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Buka Menu Anak →</Text>
          </TouchableOpacity>
        </View>

        {/* IoT Device Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔮 Fitur IoT yang Akan Datang</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Auto-sync dengan timbangan digital</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Pengukuran tinggi badan otomatis</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Bluetooth & WiFi connectivity</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Real-time data monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Riwayat pengukuran otomatis</Text>
            </View>
          </View>
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>🤖 Butuh Bantuan?</Text>
          <Text style={styles.helpText}>
            Tanyakan kepada AI Assistant untuk panduan lengkap penggunaan aplikasi
          </Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => {
              navigation.navigate('AIAssistant');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.helpButtonText}>Chat dengan AI Assistant</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.neutral.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primary.fixed,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  statusIcon: {
    fontSize: typography.fontSize.xxxl,
    marginRight: spacing.sm,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  statusDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.soft,
  },
  manualInputIcon: {
    fontSize: typography.fontSize.display,
    marginRight: spacing.md,
  },
  manualInputContent: {
    flex: 1,
  },
  manualInputTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  manualInputDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  manualInputArrow: {
    fontSize: typography.fontSize.xxxl,
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.bold,
  },
  solutionCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  solutionText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
  },
  stepContainer: {
    marginTop: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray700,
    lineHeight: 22,
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  actionButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  infoCard: {
    backgroundColor: colors.surface.low,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  featureList: {
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureBullet: {
    fontSize: typography.fontSize.lg,
    color: colors.status.success,
    marginRight: spacing.sm,
    width: 20,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    flex: 1,
  },
  helpCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  helpButton: {
    backgroundColor: colors.background.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  helpButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
  },
});
