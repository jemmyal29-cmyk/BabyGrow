/**
 * Add Child Screen — Supabase persistence via React Query mutation
 * Form: react-hook-form + zod | UI: atomic components
 */

import React, { useCallback } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import {
  Button,
  Input,
  Card,
  ScreenHeader,
} from '../components/common';
import CustomNotification from '../components/common/CustomNotification';
import { useNotification } from '../hooks/useNotification';
import {
  createChildSchema,
  mapFormToCreateInput,
  useCreateChild,
  type CreateChildFormValues,
} from '../hooks/useChildren';
import HapticService from '../services/HapticService';

interface AddChildScreenProps {
  navigation: any;
}

export default function AddChildScreen({ navigation }: AddChildScreenProps) {
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const createChild = useCreateChild();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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

  const onSubmit = useCallback(
    async (values: CreateChildFormValues) => {
      try {
        await HapticService.buttonPress();
        const payload = mapFormToCreateInput(values);
        const child = await createChild.mutateAsync(payload);
        await HapticService.success();
        showSuccess(
          'Berhasil',
          `Data anak "${child.name}" tersimpan di Supabase.`,
          () => navigation.goBack()
        );
      } catch (err) {
        await HapticService.error();
        const message = err instanceof Error ? err.message : 'Gagal menyimpan data anak';
        showError('Gagal Menyimpan', message);
      }
    },
    [createChild, navigation, showError, showSuccess]
  );

  const selectGender = useCallback(
    async (value: 'male' | 'female') => {
      await HapticService.light();
      setValue('gender', value, { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title="Tambah Anak Baru"
        subtitle="Data tersimpan ke Supabase"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>👶</Text>
            </View>
            <Text style={styles.avatarHint}>Foto opsional (segera hadir)</Text>
          </View>

          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Data Identitas</Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="Contoh: Zaki Pratama"
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
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => selectGender('male')}
                activeOpacity={0.85}
              >
                <Text style={styles.genderIcon}>👦</Text>
                <Text
                  style={[styles.genderText, gender === 'male' && styles.genderTextActive]}
                >
                  Laki-laki
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => selectGender('female')}
                activeOpacity={0.85}
              >
                <Text style={styles.genderIcon}>👧</Text>
                <Text
                  style={[styles.genderText, gender === 'female' && styles.genderTextActive]}
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
                  helperText="Format: 15/05/2024"
                  containerStyle={{ marginTop: spacing.md }}
                />
              )}
            />
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
                  label="Tinggi Lahir (cm)"
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

          <Card variant="outlined" padding="medium" style={styles.infoBox}>
            <Text style={styles.infoText}>
              Data kelahiran membantu analisis pertumbuhan (WHO z-score) lebih akurat.
            </Text>
          </Card>

          <Button
            title="Simpan Data Anak"
            onPress={handleSubmit(onSubmit)}
            loading={createChild.isPending}
            disabled={createChild.isPending}
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
  avatarEmoji: { fontSize: 56 },
  avatarHint: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  formCard: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.md,
    fontSize: 20,
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
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: colors.primary.fixed,
    borderColor: colors.primary.main,
  },
  genderIcon: {
    fontSize: 22,
    marginRight: spacing.xs,
  },
  genderText: {
    ...typography.styles.buttonText,
    fontSize: 14,
    color: colors.text.secondary,
  },
  genderTextActive: {
    color: colors.primary.main,
  },
  fieldError: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.status.error,
  },
  infoBox: {
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
});
