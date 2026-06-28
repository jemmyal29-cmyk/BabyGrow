/**
 * Add Child Screen - HALAMAN MANDIRI (ANTI POP-UP)
 * Form lengkap untuk menambahkan data anak baru
 * 
 * FITUR:
 * - Input nama lengkap
 * - Pilih jenis kelamin
 * - Input tanggal lahir
 * - Input data kelahiran (berat, tinggi)
 * - Upload foto (opsional)
 * - Validasi form lengkap
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface AddChildScreenProps {
  navigation: any;
}

export default function AddChildScreen({ navigation }: AddChildScreenProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');

  const handleSave = () => {
    // Validasi
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama anak harus diisi');
      return;
    }
    if (!gender) {
      Alert.alert('Validasi', 'Jenis kelamin harus dipilih');
      return;
    }
    if (!birthDate.trim()) {
      Alert.alert('Validasi', 'Tanggal lahir harus diisi');
      return;
    }

    // Simpan data (integrate with database service)
    Alert.alert(
      'Berhasil! 🎉',
      `Data anak "${name}" berhasil ditambahkan!\n\nAnda dapat mulai melakukan pengukuran pertumbuhan.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Anak Baru</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Placeholder */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>👶</Text>
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>📷 Tambah Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Data Identitas</Text>

            {/* Nama Lengkap */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Zaki Pratama"
                placeholderTextColor={colors.text.tertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Jenis Kelamin */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jenis Kelamin *</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={styles.genderIcon}>👦</Text>
                  <Text style={[
                    styles.genderText,
                    gender === 'male' && styles.genderTextActive,
                  ]}>
                    Laki-laki
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={styles.genderIcon}>👧</Text>
                  <Text style={[
                    styles.genderText,
                    gender === 'female' && styles.genderTextActive,
                  ]}>
                    Perempuan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tanggal Lahir */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tanggal Lahir *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.text.tertiary}
                value={birthDate}
                onChangeText={setBirthDate}
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>Format: 15/05/2024</Text>
            </View>
          </View>

          {/* Data Kelahiran */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Data Kelahiran (Opsional)</Text>

            {/* Berat Lahir */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Berat Lahir</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, styles.inputNumber]}
                  placeholder="3.2"
                  placeholderTextColor={colors.text.tertiary}
                  value={birthWeight}
                  onChangeText={setBirthWeight}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>

            {/* Tinggi Lahir */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tinggi Lahir</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, styles.inputNumber]}
                  placeholder="49"
                  placeholderTextColor={colors.text.tertiary}
                  value={birthHeight}
                  onChangeText={setBirthHeight}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Data kelahiran membantu sistem menganalisis pertumbuhan anak secara lebih akurat.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>💾 Simpan Data Anak</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.pink[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  uploadButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.pink.main,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.pink.main,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputNumber: {
    flex: 1,
    marginRight: spacing.sm,
  },
  unit: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.secondary,
  },
  helpText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: colors.pink[50],
    borderColor: colors.pink.main,
  },
  genderIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  genderText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.secondary,
  },
  genderTextActive: {
    color: colors.pink.main,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  saveButton: {
    backgroundColor: colors.pink.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.pink,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
  },
});
