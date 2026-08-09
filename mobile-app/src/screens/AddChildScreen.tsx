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
import { useForm, Controller } from 'react-hook-form';
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
import { logger } from '../utils/logger';
import { showAlert } from '../utils/alert';

const SAVE_TIMEOUT_MS = 25000;

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
  /** Feedback di atas tombol — selalu keliatan (Alert di web sering mati) */
  const [feedback, setFeedback] = useState<{
    kind: 'info' | 'error' | 'success';
    text: string;
  } | null>(null);
  const [savingLocal, setSavingLocal] = useState(false);

  const {
    control,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateChildFormValues>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      birthWeight: '',
      birthHeight: '',
    },
    mode: 'onSubmit',
    shouldUnregister: false,
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

  const handleSave = useCallback(async () => {
    if (savingLocal || createChild.isPending) return;

    void HapticService.buttonPress();
    setFeedback({ kind: 'info', text: 'Memvalidasi data…' });

    // Validasi manual — jangan andalkan handleSubmit (bisa gagal diam-diam)
    const raw = getValues();
    const parsed = createChildSchema.safeParse({
      name: raw.name ?? '',
      gender: raw.gender,
      birthDate: raw.birthDate ?? '',
      birthWeight: raw.birthWeight ?? '',
      birthHeight: raw.birthHeight ?? '',
    });
    await trigger();

    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => {
        const key = String(issue.path[0] ?? '');
        const label = FIELD_LABELS[key] ?? key;
        return `• ${label}: ${issue.message}`;
      });
      const body = messages.length
        ? `Periksa isian:\n${messages.join('\n')}`
        : 'Lengkapi nama, jenis kelamin, dan tanggal lahir (DD/MM/YYYY).';
      setFeedback({ kind: 'error', text: body });
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      showError('Data belum lengkap', body);
      showAlert('Data belum lengkap', body);
      logger.debug('[AddChild] validation failed', parsed.error.flatten());
      return;
    }

    const values = parsed.data;
    setSavingLocal(true);
    setFeedback({ kind: 'info', text: 'Menyimpan ke cloud… tunggu sebentar' });

    try {
      logger.debug('[AddChild] submit', {
        name: values.name,
        gender: values.gender,
        birthDate: values.birthDate,
      });
      const payload = mapFormToCreateInput(values);
      const motherH = parseOptionalNumber(motherHeight);
      const fatherH = parseOptionalNumber(fatherHeight);
      const motherW = parseOptionalNumber(motherWeight);
      const fatherW = parseOptionalNumber(fatherWeight);

      const savePromise = createChild.mutateAsync({
        ...payload,
        mother_height_cm: motherH ?? null,
        father_height_cm: fatherH ?? null,
        mother_weight_kg: motherW ?? null,
        father_weight_kg: fatherW ?? null,
        mother_blood: motherBlood || null,
        father_blood: fatherBlood || null,
        child_blood: childBlood || null,
      });

      const child = await Promise.race([
        savePromise,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'Timeout menyimpan (25 detik). Cek koneksi / jalankan fix-save-child-force.sql di Supabase.'
                )
              ),
            SAVE_TIMEOUT_MS
          )
        ),
      ]);

      try {
        await saveParentalMetrics(child.id, {
          motherHeightCm: motherH,
          fatherHeightCm: fatherH,
          motherWeightKg: motherW,
          fatherWeightKg: fatherW,
          motherBlood,
          fatherBlood,
          childBlood,
        });
      } catch (metricsErr) {
        logger.debug('[AddChild] parental metrics skip', metricsErr);
      }

      void HapticService.success();
      const extra = insight?.summary ? `\n\n${insight.summary}` : '';
      const okMsg = `Data anak "${child.name}" tersimpan.${extra}`;
      setFeedback({ kind: 'success', text: okMsg });
      showSuccess('Berhasil', okMsg, () => navigation.goBack());
      showAlert('Berhasil', okMsg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      void HapticService.error();
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan data anak';
      logger.debug('[AddChild] save error', message);
      setFeedback({ kind: 'error', text: message });
      showError('Gagal Menyimpan', message);
      showAlert('Gagal Menyimpan', message);
    } finally {
      setSavingLocal(false);
    }
  }, [
    savingLocal,
    createChild,
    getValues,
    trigger,
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
  ]);

  const selectGender = useCallback(
    async (value: 'male' | 'female') => {
      await HapticService.light();
      setValue('gender', value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
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

  const saving = savingLocal || createChild.isPending;

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
            <Controller
              control={control}
              name="gender"
              render={({ field: { value } }) => (
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      value === 'male' && styles.genderButtonActive,
                    ]}
                    onPress={() => selectGender('male')}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name="face-man"
                      size={22}
                      color={
                        value === 'male'
                          ? colors.primary.main
                          : colors.text.secondary
                      }
                      style={styles.genderIcon}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        value === 'male' && styles.genderTextActive,
                      ]}
                    >
                      Laki-laki
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      value === 'female' && styles.genderButtonActive,
                    ]}
                    onPress={() => selectGender('female')}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name="face-woman"
                      size={22}
                      color={
                        value === 'female'
                          ? colors.primary.main
                          : colors.text.secondary
                      }
                      style={styles.genderIcon}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        value === 'female' && styles.genderTextActive,
                      ]}
                    >
                      Perempuan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
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

          {feedback ? (
            <View
              style={[
                styles.feedbackBox,
                feedback.kind === 'error' && styles.feedbackError,
                feedback.kind === 'success' && styles.feedbackSuccess,
                feedback.kind === 'info' && styles.feedbackInfo,
              ]}
            >
              <Text style={styles.feedbackText}>{feedback.text}</Text>
            </View>
          ) : null}

          <Button
            title={saving ? 'Menyimpan…' : 'Simpan Data Anak'}
            onPress={handleSave}
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
  feedbackBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  feedbackInfo: {
    backgroundColor: colors.primary.fixed,
  },
  feedbackError: {
    backgroundColor: colors.status.errorContainer,
  },
  feedbackSuccess: {
    backgroundColor: colors.tertiary.fixed,
  },
  feedbackText: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
    textAlign: 'left',
  },
});
