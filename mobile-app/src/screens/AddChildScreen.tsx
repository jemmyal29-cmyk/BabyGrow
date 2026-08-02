/**
 * Add Child — data anak + orang tua + perhitungan tinggi/golongan darah
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button, Input, Card, ScreenHeader } from '../components/common';
import CustomNotification from '../components/common/CustomNotification';
import { useNotification } from '../hooks/useNotification';
import {
  createChildSchema,
  mapFormToCreateInput,
  useCreateChild,
  type CreateChildFormValues,
} from '../hooks/useChildren';
import HapticService from '../services/HapticService';
import {
  buildParentalInsight,
  type BloodTypeInput,
} from '../utils/parentalGrowth';
import {
  parseOptionalNumber,
  saveParentalMetrics,
} from '../utils/parentalMetricsStorage';

interface AddChildScreenProps {
  navigation: any;
}

const BLOOD_OPTIONS: BloodTypeInput[] = ['A', 'B', 'AB', 'O'];

const FIELD_LABELS: Record<string, string> = {
  name: 'Nama lengkap',
  gender: 'Jenis kelamin',
  birthDate: 'Tanggal lahir',
  birthWeight: 'Berat lahir',
  birthHeight: 'Tinggi lahir',
};

export default function AddChildScreen({ navigation }: AddChildScreenProps) {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const createChild = useCreateChild();
  const scrollRef = useRef<ScrollView>(null);

  const [motherHeight, setMotherHeight] = useState('');
  const [fatherHeight, setFatherHeight] = useState('');
  const [motherWeight, setMotherWeight] = useState('');
  const [fatherWeight, setFatherWeight] = useState('');
  const [motherBlood, setMotherBlood] = useState<BloodTypeInput>('');
  const [fatherBlood, setFatherBlood] = useState<BloodTypeInput>('');
  const [childBlood, setChildBlood] = useState<BloodTypeInput>('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateChildFormValues>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      birthDate: '',
      birthWeight: '',
      birthHeight: '',
    },
    mode: 'onSubmit',
  });

  const gender = watch('gender');
  const birthHeight = watch('birthHeight');

  const insight = useMemo(
    () =>
      buildParentalInsight(gender, {
        motherHeightCm: parseOptionalNumber(motherHeight),
        fatherHeightCm: parseOptionalNumber(fatherHeight),
        motherWeightKg: parseOptionalNumber(motherWeight),
        fatherWeightKg: parseOptionalNumber(fatherWeight),
        motherBlood,
        fatherBlood,
        childBlood,
      }),
    [
      gender,
      motherHeight,
      fatherHeight,
      motherWeight,
      fatherWeight,
      motherBlood,
      fatherBlood,
      childBlood,
    ]
  );

  const onInvalid = useCallback(
    (formErrors: FieldErrors<CreateChildFormValues>) => {
      const messages = Object.entries(formErrors)
        .map(([key, err]) => {
          const label = FIELD_LABELS[key] ?? key;
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String(err.message)
              : 'belum lengkap';
          return `• ${label}: ${msg}`;
        })
        .filter(Boolean);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      showError(
        'Data belum lengkap',
        messages.length
          ? `Periksa isian di bagian atas:\n${messages.join('\n')}`
          : 'Lengkapi nama, jenis kelamin, dan tanggal lahir (DD/MM/YYYY).'
      );
    },
    [showError]
  );

  const onSubmit = useCallback(
    async (values: CreateChildFormValues) => {
      try {
        await HapticService.buttonPress();
        const payload = mapFormToCreateInput(values);
        const motherH = parseOptionalNumber(motherHeight);
        const fatherH = parseOptionalNumber(fatherHeight);
        const motherW = parseOptionalNumber(motherWeight);
        const fatherW = parseOptionalNumber(fatherWeight);
        const child = await createChild.mutateAsync({
          ...payload,
          mother_height_cm: motherH ?? null,
          father_height_cm: fatherH ?? null,
          mother_weight_kg: motherW ?? null,
          father_weight_kg: fatherW ?? null,
          mother_blood: motherBlood || null,
          father_blood: fatherBlood || null,
          child_blood: childBlood || null,
        });
        // Cadangan lokal (jika kolom DB belum di-migrate)
        await saveParentalMetrics(child.id, {
          motherHeightCm: motherH,
          fatherHeightCm: fatherH,
          motherWeightKg: motherW,
          fatherWeightKg: fatherW,
          motherBlood,
          fatherBlood,
          childBlood,
        });
        await HapticService.success();
        const extra = insight?.summary ? `\n\n${insight.summary}` : '';
        showSuccess(
          'Berhasil',
          `Data anak "${child.name}" tersimpan.${extra}`,
          () => navigation.goBack()
        );
      } catch (err) {
        await HapticService.error();
        const message =
          err instanceof Error ? err.message : 'Gagal menyimpan data anak';
        showError('Gagal Menyimpan', message);
      }
    },
    [
      createChild,
      navigation,
      showError,
      showSuccess,
      motherHeight,
      fatherHeight,
      motherWeight,
      fatherWeight,
      motherBlood,
      fatherBlood,
      childBlood,
      insight,
    ]
  );

  const selectGender = useCallback(
    async (value: 'male' | 'female') => {
      await HapticService.light();
      setValue('gender', value, { shouldValidate: true });
    },
    [setValue]
  );

  const BloodChips = ({
    value,
    onChange,
  }: {
    value: BloodTypeInput;
    onChange: (v: BloodTypeInput) => void;
  }) => (
    <View style={styles.bloodRow}>
      {BLOOD_OPTIONS.map((b) => {
        const active = value === b;
        return (
          <TouchableOpacity
            key={b}
            style={[styles.bloodChip, active && styles.bloodChipActive]}
            onPress={() => onChange(active ? '' : b)}
          >
            <Text
              style={[
                styles.bloodChipText,
                active && styles.bloodChipTextActive,
              ]}
            >
              {b}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const saving = createChild.isPending || isSubmitting;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title="Tambah Anak Baru"
        subtitle="Lengkapi data anak & orang tua"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="baby-face-outline"
                size={48}
                color={colors.primary.main}
              />
            </View>
            <Text style={styles.avatarHint}>Foto opsional (segera hadir)</Text>
          </View>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Data Identitas Anak</Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="Nama lengkap anak"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Text style={styles.label}>Jenis Kelamin *</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => selectGender('male')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="face-man"
                  size={22}
                  color={
                    gender === 'male'
                      ? colors.primary.main
                      : colors.text.secondary
                  }
                  style={styles.genderIcon}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'male' && styles.genderTextActive,
                  ]}
                >
                  Laki-laki
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => selectGender('female')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="face-woman"
                  size={22}
                  color={
                    gender === 'female'
                      ? colors.primary.main
                      : colors.text.secondary
                  }
                  style={styles.genderIcon}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'female' && styles.genderTextActive,
                  ]}
                >
                  Perempuan
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender?.message ? (
              <Text style={styles.fieldError}>{errors.gender.message}</Text>
            ) : null}

            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Tanggal Lahir"
                  required
                  placeholder="DD/MM/YYYY"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numbers-and-punctuation"
                  error={errors.birthDate?.message}
                  helperText="Wajib format: 15/05/2024 (hari/bulan/tahun)"
                  containerStyle={{ marginTop: spacing.md }}
                />
              )}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              Golongan darah anak (jika sudah diketahui)
            </Text>
            <BloodChips value={childBlood} onChange={setChildBlood} />
          </Card>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Data Kelahiran (Opsional)</Text>

            <Controller
              control={control}
              name="birthWeight"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Berat Lahir (kg)"
                  placeholder="3.2"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  error={errors.birthWeight?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="birthHeight"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Tinggi / Panjang Lahir (cm)"
                  placeholder="49"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  error={errors.birthHeight?.message}
                />
              )}
            />
          </Card>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Data Orang Tua</Text>
            <Text style={styles.helper}>
              Dipakai untuk perkiraan tinggi dewasa anak dan kemungkinan
              golongan darah. Boleh dikosongkan dulu.
            </Text>

            <Input
              label="Tinggi ibu (cm)"
              placeholder="155"
              value={motherHeight}
              onChangeText={setMotherHeight}
              keyboardType="decimal-pad"
            />
            <Input
              label="Berat ibu (kg)"
              placeholder="55"
              value={motherWeight}
              onChangeText={setMotherWeight}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Golongan darah ibu</Text>
            <BloodChips value={motherBlood} onChange={setMotherBlood} />

            <View style={{ height: spacing.md }} />

            <Input
              label="Tinggi ayah (cm)"
              placeholder="168"
              value={fatherHeight}
              onChangeText={setFatherHeight}
              keyboardType="decimal-pad"
            />
            <Input
              label="Berat ayah (kg)"
              placeholder="70"
              value={fatherWeight}
              onChangeText={setFatherWeight}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Golongan darah ayah</Text>
            <BloodChips value={fatherBlood} onChange={setFatherBlood} />
          </Card>

          {insight ? (
            <Card variant="elevated" padding="large" style={styles.insightCard}>
              <Text style={styles.insightTitle}>Hasil perhitungan otomatis</Text>
              <Text style={styles.insightBody}>{insight.summary}</Text>
              {birthHeight && parseOptionalNumber(birthHeight) ? (
                <Text style={styles.insightBody}>
                  Panjang lahir {parseOptionalNumber(birthHeight)} cm tercatat
                  untuk pemantauan pertumbuhan (standar WHO).
                </Text>
              ) : null}
            </Card>
          ) : (
            <Card variant="outlined" padding="medium" style={styles.infoBox}>
              <Text style={styles.infoText}>
                Isi tinggi & golongan darah ayah/ibu untuk melihat perkiraan
                langsung. Data ini membantu petugas memantau tumbuh kembang
                lebih lengkap.
              </Text>
            </Card>
          )}

          {saving ? (
            <Text style={styles.savingHint}>Menyimpan ke cloud… tunggu sebentar</Text>
          ) : null}

          <Button
            title="Simpan Data Anak"
            onPress={handleSubmit(onSubmit, onInvalid)}
            loading={saving}
            disabled={saving}
            size="large"
            haptic={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomNotification
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => {
          hideNotification();
          if (notification.type === 'success') {
            navigation.goBack();
          }
        }}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.section,
    gap: spacing.stackGap,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.diffusion,
  },
  avatarHint: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  formCard: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  sectionTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.lg,
  },
  helper: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.styles.labelCaps,
    color: colors.text.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.element,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: colors.primary.fixed,
    borderColor: colors.primary.main,
  },
  genderIcon: { marginRight: spacing.xs },
  genderText: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  genderTextActive: { color: colors.primary.main },
  fieldError: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.status.error,
  },
  bloodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.low,
  },
  bloodChipActive: { backgroundColor: colors.primary.main },
  bloodChipText: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  bloodChipTextActive: { color: colors.text.inverse },
  insightCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary.fixed,
  },
  insightTitle: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  insightBody: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  infoBox: { marginBottom: spacing.sm },
  infoText: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  savingHint: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
