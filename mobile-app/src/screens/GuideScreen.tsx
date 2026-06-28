/**
 * Guide Screen - Panduan Penggunaan Aplikasi
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';

const GUIDE_SECTIONS = [
  {
    icon: '🏠',
    title: 'Menu Beranda',
    content: 'Lihat ringkasan status kesehatan anak, akses fitur cepat, dan notifikasi penting.',
  },
  {
    icon: '👶',
    title: 'Profil Anak',
    content: 'Tambah dan kelola data anak: nama, tanggal lahir, jenis kelamin, berat badan, tinggi badan.',
  },
  {
    icon: '📊',
    title: 'Grafik Pertumbuhan',
    content: 'Visualisasi pertumbuhan anak dibandingkan dengan standar WHO (Berat/Umur, Tinggi/Umur).',
  },
  {
    icon: '🤖',
    title: 'AI Analisis',
    content: 'Chat dengan AI untuk analisis kesehatan, saran nutrisi, dan deteksi risiko stunting.',
  },
  {
    icon: '📱',
    title: 'IoT Device',
    content: 'Hubungkan timbangan digital untuk pengukuran otomatis (dalam pengembangan).',
  },
  {
    icon: '💉',
    title: 'Jadwal Imunisasi',
    content: 'Lihat jadwal vaksin wajib berdasarkan usia anak sesuai program pemerintah.',
  },
];

export default function GuideScreen({ navigation }: any) {
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
        <Text style={styles.headerTitle}>Panduan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>📝</Text>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Halaman Panduan Sedang Diperbarui</Text>
            <Text style={styles.statusDesc}>
              Kami sedang menyempurnakan dokumentasi untuk memberikan pengalaman terbaik
            </Text>
          </View>
        </View>

        {/* AI Solution */}
        <View style={styles.aiSolutionCard}>
          <Text style={styles.aiTitle}>🤖 Panduan Berjalan dengan AI</Text>
          <Text style={styles.aiDesc}>
            Dapatkan panduan real-time dan jawaban instant untuk semua pertanyaan Anda dengan AI Assistant!
          </Text>
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => navigation.navigate('AIAssistant')}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>Buka AI Assistant →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Guide */}
        <View style={styles.quickGuideCard}>
          <Text style={styles.sectionTitle}>📚 Panduan Singkat</Text>
          
          {GUIDE_SECTIONS.map((section, index) => (
            <View key={index} style={styles.guideItem}>
              <View style={styles.guideIcon}>
                <Text style={styles.guideIconText}>{section.icon}</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>{section.title}</Text>
                <Text style={styles.guideText}>{section.content}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Getting Started */}
        <View style={styles.stepCard}>
          <Text style={styles.sectionTitle}>🚀 Memulai BabyGrow</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tambah Profil Anak</Text>
              <Text style={styles.stepText}>
                Klik menu "Anak" → "Tambah Anak Baru" → Isi data lengkap (nama, tanggal lahir, jenis kelamin)
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Input Data Pengukuran</Text>
              <Text style={styles.stepText}>
                Pilih anak → Klik "Edit" atau "Ukur Sekarang" → Masukkan Berat Badan dan Tinggi Badan
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Lihat Analisis AI</Text>
              <Text style={styles.stepText}>
                Buka menu "AI Analisis" → Tanyakan "Analisis pertumbuhan anak saya" → Dapatkan hasil lengkap
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Monitor Grafik Pertumbuhan</Text>
              <Text style={styles.stepText}>
                Klik menu "Grafik" untuk melihat visualisasi pertumbuhan dibandingkan standar WHO
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.faqCard}>
          <Text style={styles.sectionTitle}>❓ Pertanyaan Umum</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Bagaimana cara menambah anak?</Text>
            <Text style={styles.faqAnswer}>
              Menu Anak → Tombol "+" → Isi formulir → Simpan
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Data saya aman?</Text>
            <Text style={styles.faqAnswer}>
              Ya! Data dienkripsi end-to-end dan tersimpan aman di server bersertifikat ISO 27001.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Apakah AI bisa menggantikan dokter?</Text>
            <Text style={styles.faqAnswer}>
              Tidak. AI adalah alat bantu monitoring. Untuk diagnosis dan pengobatan, tetap konsultasi dengan dokter.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Bagaimana cara menggunakan IoT device?</Text>
            <Text style={styles.faqAnswer}>
              Fitur IoT sedang dikembangkan. Saat ini gunakan input manual terlebih dahulu.
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>💬 Butuh Bantuan Lebih?</Text>
          <Text style={styles.supportText}>
            Tim support kami siap membantu Anda 24/7
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>📧 Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => navigation.navigate('AIAssistant')}
              activeOpacity={0.7}
            >
              <Text style={styles.contactButtonText}>🤖 AI Chat</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 24,
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
    backgroundColor: '#FFF3CD',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  statusIcon: {
    fontSize: 32,
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
  aiSolutionCard: {
    backgroundColor: '#E3F2FD',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  aiDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  aiButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  aiButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  quickGuideCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  guideIconText: {
    fontSize: 24,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  guideText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 18,
  },
  stepCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  faqItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  faqQuestion: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: '#FFF0F5',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  supportText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactButton: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  contactButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary.main,
  },
});
