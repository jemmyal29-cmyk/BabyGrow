/**
 * Immunization Schedule Screen - Jadwal Vaksin
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';

// Jadwal vaksin berdasarkan usia (bulan)
const VACCINE_SCHEDULE = [
  { name: 'Hepatitis B (HB-0)', age: 0, description: 'Diberikan segera setelah lahir (0-24 jam)' },
  { name: 'BCG', age: 1, description: 'Melindungi dari TBC' },
  { name: 'Polio 1', age: 1, description: 'Dosis pertama pencegahan polio' },
  { name: 'DPT-HB-Hib 1', age: 2, description: 'Difteri, Pertusis, Tetanus, Hepatitis B, Haemophilus Influenza B' },
  { name: 'Polio 2', age: 2, description: 'Dosis kedua pencegahan polio' },
  { name: 'DPT-HB-Hib 2', age: 3, description: 'Dosis kedua kombinasi vaksin' },
  { name: 'Polio 3', age: 3, description: 'Dosis ketiga pencegahan polio' },
  { name: 'DPT-HB-Hib 3', age: 4, description: 'Dosis ketiga kombinasi vaksin' },
  { name: 'Polio 4', age: 4, description: 'Dosis keempat pencegahan polio' },
  { name: 'IPV', age: 4, description: 'Inactivated Poliovirus Vaccine' },
  { name: 'Campak/MR 1', age: 9, description: 'Melindungi dari campak dan rubella' },
  { name: 'DPT-HB-Hib Booster', age: 18, description: 'Penguat kekebalan tubuh' },
  { name: 'Campak/MR 2', age: 18, description: 'Dosis booster campak/rubella' },
];

export default function ImmunizationScreen({ navigation }: any) {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const getVaccinesForAge = (ageMonths: number) => {
    return VACCINE_SCHEDULE.filter(vaccine => vaccine.age === ageMonths);
  };

  const getUpcomingVaccines = (currentAge: number) => {
    return VACCINE_SCHEDULE.filter(vaccine => vaccine.age > currentAge).slice(0, 3);
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
        <Text style={styles.headerTitle}>Jadwal Imunisasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>⚙️</Text>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Modul Sedang Dikalibrasi</Text>
            <Text style={styles.statusDesc}>
              Sistem reminder dan sinkronisasi dengan data anak sedang dalam tahap finalisasi
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Informasi Penting</Text>
          <Text style={styles.infoText}>
            Berikut adalah jadwal imunisasi wajib berdasarkan program pemerintah Indonesia (Kementerian Kesehatan RI).
          </Text>
          <Text style={styles.infoText}>
            Pastikan anak Anda mendapatkan vaksinasi sesuai jadwal untuk perlindungan optimal.
          </Text>
        </View>

        {/* Vaccine Schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>📅 Jadwal Lengkap Imunisasi</Text>
          
          {VACCINE_SCHEDULE.map((vaccine, index) => (
            <View key={index} style={styles.vaccineItem}>
              <View style={styles.vaccineAgeContainer}>
                <Text style={styles.vaccineAge}>
                  {vaccine.age === 0 ? 'Lahir' : `${vaccine.age} bln`}
                </Text>
              </View>
              <View style={styles.vaccineDetails}>
                <Text style={styles.vaccineName}>{vaccine.name}</Text>
                <Text style={styles.vaccineDesc}>{vaccine.description}</Text>
              </View>
              <View style={styles.vaccineCheckbox}>
                <Text style={styles.checkboxIcon}>□</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Age Calculator */}
        <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>🔍 Cek Vaksin untuk Usia Tertentu</Text>
          <Text style={styles.calculatorDesc}>
            Pilih usia anak untuk melihat vaksin yang seharusnya sudah diterima:
          </Text>
          
          <View style={styles.ageButtonContainer}>
            {[0, 1, 2, 3, 4, 6, 9, 12, 18, 24].map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.ageButton,
                  selectedAge === age && styles.ageButtonActive
                ]}
                onPress={() => setSelectedAge(age)}
              >
                <Text style={[
                  styles.ageButtonText,
                  selectedAge === age && styles.ageButtonTextActive
                ]}>
                  {age === 0 ? 'Lahir' : `${age} bln`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedAge !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                Vaksin untuk usia {selectedAge === 0 ? 'lahir' : `${selectedAge} bulan`}:
              </Text>
              {getVaccinesForAge(selectedAge).map((vaccine, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultBullet}>✓</Text>
                  <Text style={styles.resultText}>{vaccine.name}</Text>
                </View>
              ))}
              {getVaccinesForAge(selectedAge).length === 0 && (
                <Text style={styles.noVaccineText}>
                  Tidak ada vaksin yang dijadwalkan untuk usia ini
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💉 Tips Vaksinasi</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Pastikan anak dalam kondisi sehat saat vaksinasi
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Bawa buku KIA (Kesehatan Ibu dan Anak) setiap vaksinasi
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Hindari makanan/minuman tertentu sesuai anjuran dokter
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Perhatikan reaksi setelah vaksinasi (demam ringan adalah normal)
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Vaksinasi gratis tersedia di Posyandu dan Puskesmas
            </Text>
          </View>
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>🤖 Butuh Informasi Lebih?</Text>
          <Text style={styles.helpText}>
            Tanyakan kepada AI Assistant untuk mendapatkan penjelasan detail tentang vaksin tertentu
          </Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate('AIAssistant')}
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
    backgroundColor: '#FFFFFF', // Solid white background
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
  infoCard: {
    backgroundColor: '#E8F5E9',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  vaccineAgeContainer: {
    width: 50,
    alignItems: 'center',
  },
  vaccineAge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  vaccineDetails: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  vaccineName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
  },
  vaccineDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray600,
    marginTop: 2,
  },
  vaccineCheckbox: {
    width: 30,
    alignItems: 'center',
  },
  checkboxIcon: {
    fontSize: 20,
    color: colors.neutral.gray400,
  },
  calculatorCard: {
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  calculatorDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
  },
  ageButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  ageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F5F5F5', // Solid light gray
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray400,
  },
  ageButtonActive: {
    backgroundColor: '#FF69B4', // Solid pink
    borderColor: '#FF1493',
    borderWidth: 3,
  },
  ageButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
  },
  ageButtonTextActive: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.bold,
  },
  resultContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray100,
    borderRadius: borderRadius.md,
  },
  resultTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultBullet: {
    fontSize: typography.fontSize.md,
    color: colors.status.success,
    marginRight: spacing.sm,
  },
  resultText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
  },
  noVaccineText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
  },
  tipsCard: {
    backgroundColor: '#FFF0F5',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontSize: typography.fontSize.md,
    color: colors.primary.main,
    marginRight: spacing.sm,
    width: 15,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    lineHeight: 20,
  },
  helpCard: {
    backgroundColor: '#FFFFFF', // Solid white
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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
