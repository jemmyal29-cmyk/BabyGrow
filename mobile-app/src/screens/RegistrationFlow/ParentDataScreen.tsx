/**
 * FASE 1: Data Orang Tua & Profiling Medis
 * Mengumpulkan informasi orang tua dan riwayat penyakit
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';

export default function ParentDataScreen({ navigation }: any) {
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Riwayat Kesehatan Orang Tua
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasStuntingHistory, setHasStuntingHistory] = useState(false);
  const [hasObesity, setHasObesity] = useState(false);
  const [otherConditions, setOtherConditions] = useState('');

  const handleNext = () => {
    // Validasi
    if (!parentName.trim()) {
      Alert.alert('Peringatan', 'Nama orang tua wajib diisi');
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert('Peringatan', 'Nomor telepon wajib diisi');
      return;
    }

    const parentData = {
      name: parentName,
      phone,
      email,
      address,
      medicalHistory: {
        diabetes: hasDiabetes,
        hypertension: hasHypertension,
        stuntingHistory: hasStuntingHistory,
        obesity: hasObesity,
        other: otherConditions,
      },
    };

    // Simpan data dan lanjut ke Data Anak
    navigation.navigate('ChildData', { parentData });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>Langkah 1 dari 2</Text>
          <Text style={styles.title}>Data Orang Tua</Text>
          <Text style={styles.subtitle}>
            Informasi ini penting untuk analisis risiko stunting
          </Text>
        </View>

        {/* Form Data Pribadi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Data Pribadi</Text>
          
          <Text style={styles.label}>
            Nama Lengkap <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nama orang tua/wali"
            value={parentName}
            onChangeText={setParentName}
          />

          <Text style={styles.label}>
            Nomor Telepon <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="08xxxxxxxxxx"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email (Opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Alamat (Opsional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Alamat lengkap"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Riwayat Kesehatan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Riwayat Kesehatan Keluarga</Text>
          <Text style={styles.sectionDesc}>
            Informasi ini membantu AI menganalisis faktor risiko
          </Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasDiabetes(!hasDiabetes)}
          >
            <View style={[styles.checkbox, hasDiabetes && styles.checkboxChecked]}>
              {hasDiabetes && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Diabetes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasHypertension(!hasHypertension)}
          >
            <View style={[styles.checkbox, hasHypertension && styles.checkboxChecked]}>
              {hasHypertension && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Hipertensi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasStuntingHistory(!hasStuntingHistory)}
          >
            <View style={[styles.checkbox, hasStuntingHistory && styles.checkboxChecked]}>
              {hasStuntingHistory && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Riwayat Stunting dalam Keluarga</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasObesity(!hasObesity)}
          >
            <View style={[styles.checkbox, hasObesity && styles.checkboxChecked]}>
              {hasObesity && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Obesitas</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Kondisi Lain (Opsional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Sebutkan kondisi kesehatan lain jika ada"
            value={otherConditions}
            onChangeText={setOtherConditions}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Data kesehatan keluarga membantu AI memberikan rekomendasi yang lebih personal
          </Text>
        </View>

        {/* Tombol Next */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Lanjut ke Data Anak →</Text>
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral.gray400,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkmark: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray700,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#1976D2',
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
