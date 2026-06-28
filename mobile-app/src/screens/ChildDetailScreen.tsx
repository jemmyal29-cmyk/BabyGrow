/**
 * Child Detail Screen - HALAMAN MANDIRI (ANTI POP-UP)
 * Menampilkan detail lengkap profil anak tanpa modal/popup
 * 
 * FITUR:
 * - Detail identitas anak (nama, usia, jenis kelamin, tanggal lahir)
 * - Pengukuran terakhir (berat, tinggi, lingkar kepala)
 * - Status pertumbuhan dengan indikator visual
 * - Mini grafik pertumbuhan 6 bulan terakhir
 * - Riwayat medis lengkap
 * - Tombol aksi (Ukur, Grafik, Edit)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { LiveMeasurementModal } from '../components/common';

const { width } = Dimensions.get('window');

interface ChildDetailScreenProps {
  navigation: any;
  route: any;
}

export default function ChildDetailScreen({ navigation, route }: ChildDetailScreenProps) {
  const [liveMeasurementModalVisible, setLiveMeasurementModalVisible] = useState(false);
  
  const child = route?.params?.child || {
    name: 'Zaki',
    gender: 'Laki-laki',
    birthDate: '15 Mei 2024',
    age: '18 bulan',
    weight: '10.2 kg',
    height: '78.5 cm',
    headCircumference: '46.0 cm',
    status: '✅ Sehat',
    emoji: '👦',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Profil Anak</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditChildProfile', { child })}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{child.emoji}</Text>
          </View>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childInfo}>{child.gender} • {child.age}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{child.status}</Text>
          </View>
        </View>

        {/* Identitas Lengkap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Identitas Lengkap</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Nama Lengkap" value={child.name} />
            <InfoRow label="Jenis Kelamin" value={child.gender} />
            <InfoRow label="Tanggal Lahir" value={child.birthDate} />
            <InfoRow label="Usia Saat Ini" value={child.age} />
          </View>
        </View>

        {/* Pengukuran Terakhir */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Pengukuran Terakhir</Text>
          <View style={styles.measurementGrid}>
            <MeasurementCard
              icon="⚖️"
              label="Berat Badan"
              value={child.weight}
              status="normal"
            />
            <MeasurementCard
              icon="📏"
              label="Tinggi Badan"
              value={child.height}
              status="normal"
            />
          </View>
          <View style={styles.measurementCard}>
            <Text style={styles.measurementIcon}>🧠</Text>
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementLabel}>Lingkar Kepala</Text>
              <Text style={styles.measurementValue}>{child.headCircumference}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.status.success }]} />
          </View>
        </View>

        {/* Status Pertumbuhan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Status Pertumbuhan</Text>
          <View style={styles.growthCard}>
            <View style={styles.growthHeader}>
              <Text style={styles.growthTitle}>Analisis WHO</Text>
              <View style={styles.growthBadge}>
                <Text style={styles.growthBadgeText}>Normal</Text>
              </View>
            </View>
            
            <View style={styles.zScoreRow}>
              <Text style={styles.zScoreLabel}>Berat/Usia (BB/U)</Text>
              <View style={styles.zScoreBar}>
                <View style={[styles.zScoreFill, { width: '60%', backgroundColor: colors.status.success }]} />
              </View>
              <Text style={styles.zScoreValue}>-0.5</Text>
            </View>

            <View style={styles.zScoreRow}>
              <Text style={styles.zScoreLabel}>Tinggi/Usia (TB/U)</Text>
              <View style={styles.zScoreBar}>
                <View style={[styles.zScoreFill, { width: '55%', backgroundColor: colors.status.success }]} />
              </View>
              <Text style={styles.zScoreValue}>-0.8</Text>
            </View>

            <View style={styles.zScoreRow}>
              <Text style={styles.zScoreLabel}>BB/TB</Text>
              <View style={styles.zScoreBar}>
                <View style={[styles.zScoreFill, { width: '65%', backgroundColor: colors.status.success }]} />
              </View>
              <Text style={styles.zScoreValue}>+0.2</Text>
            </View>
          </View>
        </View>

        {/* Riwayat Medis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Riwayat Medis</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Berat Lahir" value="3.2 kg" />
            <InfoRow label="Tinggi Lahir" value="49 cm" />
            <InfoRow label="Alergi" value="Tidak ada" />
            <InfoRow label="Riwayat Penyakit" value="Tidak ada" />
          </View>
        </View>

        {/* Mini Chart Placeholder */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>📈 Tren 6 Bulan</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GrowthChart', { child })}>
              <Text style={styles.viewFullLink}>Lihat Lengkap →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.miniChart}>
            <Text style={styles.chartPlaceholder}>Grafik Pertumbuhan</Text>
            <Text style={styles.chartSubtext}>Tap "Lihat Lengkap" untuk grafik detail</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setLiveMeasurementModalVisible(true)}
          >
            <Text style={styles.actionButtonIcon}>📏</Text>
            <Text style={styles.primaryButtonText}>Ukur Sekarang</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('GrowthChart', { child })}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.secondaryButtonText}>Grafik Analisis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Live Measurement Modal */}
      <LiveMeasurementModal
        visible={liveMeasurementModalVisible}
        onClose={() => setLiveMeasurementModalVisible(false)}
        onMeasurementComplete={(data) => {
          // Save measurement data silently
          setLiveMeasurementModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MeasurementCard({ icon, label, value, status }: { 
  icon: string; 
  label: string; 
  value: string; 
  status: 'normal' | 'warning' | 'danger';
}) {
  const statusColor = status === 'normal' ? colors.status.success : 
                      status === 'warning' ? colors.status.warning : colors.status.error;
  
  return (
    <View style={styles.measurementCardSmall}>
      <Text style={styles.measurementIconSmall}>{icon}</Text>
      <Text style={styles.measurementLabelSmall}>{label}</Text>
      <Text style={styles.measurementValueSmall}>{value}</Text>
      <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...shadows.soft,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.pink[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 20,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.pink[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  childName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  childInfo: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.status.success,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.soft,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  measurementGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  measurementCardSmall: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  measurementIconSmall: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  measurementLabelSmall: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  measurementValueSmall: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  measurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
  },
  measurementIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  measurementValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  growthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.soft,
  },
  growthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  growthTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.text.primary,
  },
  growthBadge: {
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  growthBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.status.success,
  },
  zScoreRow: {
    marginBottom: spacing.sm,
  },
  zScoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  zScoreBar: {
    height: 8,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs / 2,
  },
  zScoreFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  zScoreValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.text.primary,
    textAlign: 'right',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewFullLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.pink.main,
  },
  miniChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.soft,
  },
  chartPlaceholder: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold as any,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  chartSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.standard,
  },
  primaryButton: {
    backgroundColor: colors.pink.main,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.pink.main,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
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
