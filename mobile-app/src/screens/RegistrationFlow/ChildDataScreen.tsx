/**
 * FASE 1: Data Anak (Lanjutan dari Data Orang Tua)
 * Mengumpulkan informasi anak untuk pertama kali
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {colors, typography, spacing, borderRadius} from '../../theme';

export default function ChildDataScreen({ navigation, route }: any) {
  const { parentData } = route.params;

  const [childName, setChildName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate.length !== 10) return '';
    
    const [day, month, year] = birthDate.split('/').map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    
    if (today.getDate() < birth.getDate()) {
      months--;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} tahun ${remainingMonths} bulan`;
    }
    return `${remainingMonths} bulan`;
  };

  const validateBirthDate = (date: string) => {
    if (date.length === 10) {
      const [day, month, year] = date.split('/').map(Number);
      
      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;
      if (year < 2015 || year > new Date().getFullYear()) return false;

      const birthDate = new Date(year, month - 1, day);
      if (birthDate > new Date()) return false;

      return true;
    }
    return false;
  };

  const handleNext = async () => {
    // Validasi
    if (!childName.trim()) {
      Alert.alert('Peringatan', 'Nama anak wajib diisi');
      return;
    }

    if (!gender) {
      Alert.alert('Peringatan', 'Jenis kelamin wajib dipilih');
      return;
    }

    if (!birthDate) {
      Alert.alert('Peringatan', 'Tanggal lahir wajib diisi');
      return;
    }

    if (!validateBirthDate(birthDate)) {
      Alert.alert(
        'Peringatan',
        'Format tanggal tidak valid. Gunakan format DD/MM/YYYY dan pastikan tanggal valid'
      );
      return;
    }

    const childData = {
      name: childName,
      gender,
      dateOfBirth: birthDate,
      birthWeight: birthWeight ? parseFloat(birthWeight) : null,
      birthHeight: birthHeight ? parseFloat(birthHeight) : null,
    };

    // Konfirmasi sebelum menyimpan
    Alert.alert(
      'Konfirmasi Data',
      `Nama: ${childName}\nJenis Kelamin: ${gender === 'male' ? 'Laki-laki' : 'Perempuan'}\nUsia: ${calculateAge(birthDate)}\n\nApakah data sudah benar?`,
      [
        { text: 'Ubah', style: 'cancel' },
        {
          text: 'Ya, Lanjutkan',
          onPress: () => {
            // Simpan semua data
            const completeData = {
              parent: parentData,
              child: childData,
            };

            // TODO: Save to AsyncStorage or API
            console.log('Complete Registration Data:', completeData);

            // Navigasi ke Main App dengan instruksi IoT
            Alert.alert(
              '✅ Registrasi Berhasil!',
              'Selanjutnya, hubungkan alat IoT untuk mulai mengukur pertumbuhan anak Anda.',
              [
                {
                  text: 'Hubungkan IoT',
                  onPress: () => navigation.replace('MainTabs'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const formatDate = (text: string) => {
    // Auto-format DD/MM/YYYY
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Langkah 2 dari 2</Text>
          <Text style={styles.title}>Data Anak</Text>
          <Text style={styles.subtitle}>
            Informasi dasar untuk memulai pemantauan pertumbuhan
          </Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nama Anak <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nama lengkap anak"
            value={childName}
            onChangeText={setChildName}
          />

          <Text style={styles.label}>
            Jenis Kelamin <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextActive,
                ]}
              >
                👦 Laki-laki
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextActive,
                ]}
              >
                👧 Perempuan
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            Tanggal Lahir <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY (contoh: 15/06/2023)"
            value={birthDate}
            onChangeText={(text) => setBirthDate(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
          />
          {birthDate && validateBirthDate(birthDate) && (
            <Text style={styles.ageHint}>Usia: {calculateAge(birthDate)}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.optionalSection}>Data Kelahiran (Opsional)</Text>

          <Text style={styles.label}>Berat Lahir (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="contoh: 3.2"
            value={birthWeight}
            onChangeText={setBirthWeight}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Panjang Lahir (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="contoh: 48"
            value={birthHeight}
            onChangeText={setBirthHeight}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📊</Text>
          <Text style={styles.infoText}>
            Data kelahiran membantu AI menganalisis pola pertumbuhan dengan lebih akurat
          </Text>
        </View>

        {/* Tombol Selesai */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Selesai & Mulai Menggunakan</Text>
        </TouchableOpacity>

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
    padding: spacing.lg,
    backgroundColor: colors.primary.main,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  section: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  required: {
    color: colors.status.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.neutral.white,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  genderButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray600,
  },
  genderButtonTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  ageHint: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.gray200,
    marginVertical: spacing.lg,
  },
  optionalSection: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray600,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary.fixed,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.stunting.stunted,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
