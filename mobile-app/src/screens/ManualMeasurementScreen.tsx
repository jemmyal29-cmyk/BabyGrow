/**
 * Manual Measurement — validate → WHO Z-score → Supabase (offline queue)
 * Visual: Measurement Dashboard (desainuiux.md)
 *
 * Circuit breaker: never save against a stale/empty activeChild.
 * Route params `{ childId }` bind the store if Detail/Children forgot to lock.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';
import { Card, Button, ScreenHeader } from '../components/common';
import MQTTService from '../services/MQTTService';
import MeasurementSyncService from '../services/MeasurementSyncService';
import HapticService from '../services/HapticService';
import { useChildStore } from '../store/childStore';
import { getStuntingDisplay } from '../hooks/useMeasurements';
import { ageLabelFromDob } from '../hooks/useChildren';
import { supabase } from '../services/SupabaseClient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { showAlert } from '../utils/alert';

const ManualFormSchema = z.object({
  height_cm: z
    .number({ invalid_type_error: 'Tinggi badan harus berupa angka' })
    .min(40, 'Tinggi minimal 40 cm')
    .max(130, 'Tinggi maksimal 130 cm'),
  weight_kg: z
    .number({ invalid_type_error: 'Berat badan harus berupa angka' })
    .min(2, 'Berat minimal 2 kg')
    .max(30, 'Berat maksimal 30 kg')
    .optional()
    .nullable(),
});

function safeFixed(value: unknown, digits = 1): string {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

export default function ManualMeasurementScreen({ navigation, route }: any) {
  const activeChild = useChildStore((s) => s.activeChild);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const routeChildId =
    typeof route?.params?.childId === 'string' ? route.params.childId : undefined;

  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [binding, setBinding] = React.useState(
    () => !!routeChildId && activeChild?.id !== routeChildId
  );

  const mqttService = React.useMemo(() => MQTTService.getInstance(), []);
  const syncService = React.useMemo(
    () => MeasurementSyncService.getInstance(),
    []
  );

  // Bind route childId → global store (prevents Haikal screen saving as Sayyid)
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!routeChildId) {
        setBinding(false);
        return;
      }
      if (activeChild?.id === routeChildId) {
        setBinding(false);
        return;
      }

      setBinding(true);
      try {
        const { data, error } = await supabase
          .from('children')
          .select('id, name, gender, date_of_birth')
          .eq('id', routeChildId)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data?.id) {
          setBinding(false);
          return;
        }
        setActiveChild({
          id: String(data.id),
          name: String(data.name ?? ''),
          gender: data.gender === 'female' ? 'female' : 'male',
          date_of_birth: String(data.date_of_birth ?? ''),
        });
      } catch {
        // Leave binding=false so circuit breaker UI can show
      } finally {
        if (!cancelled) setBinding(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bind once per routeChildId
  }, [routeChildId, setActiveChild]);

  React.useEffect(() => {
    syncService.start();
  }, [syncService]);

  React.useEffect(() => {
    const latestData = mqttService.getLatestMeasurement();
    if (latestData && latestData.height_cm > 0) {
      setHeight(latestData.height_cm.toFixed(1));
      setWeight(latestData.weight_kg > 0 ? latestData.weight_kg.toFixed(1) : '');
      setIsAutoFilled(true);
      void HapticService.success();
    }
  }, [mqttService]);

  const handleSave = async () => {
    if (saving) return;

    const child = useChildStore.getState().activeChild;
    if (!child?.id || !child.gender || !child.date_of_birth) {
      showAlert(
        'Pilih Anak',
        'Data anak belum terkunci. Buka profil anak lalu tekan Ukur Manual lagi.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Pilih Anak',
            onPress: () => navigation.navigate('Children'),
          },
        ]
      );
      return;
    }

    // Route vs store mismatch — refuse save (state leak defense)
    if (routeChildId && child.id !== routeChildId) {
      showAlert(
        'Anak tidak cocok',
        'Profil anak di layar tidak cocok dengan yang dipilih. Kembali ke detail anak lalu ulangi.'
      );
      return;
    }

    const heightNum = parseFloat(height.replace(',', '.'));
    const weightRaw = weight.trim();
    const weightNum = weightRaw
      ? parseFloat(weightRaw.replace(',', '.'))
      : null;

    const parsed = ManualFormSchema.safeParse({
      height_cm: Number.isFinite(heightNum) ? heightNum : undefined,
      weight_kg:
        weightNum != null && Number.isFinite(weightNum) ? weightNum : null,
    });

    if (!parsed.success) {
      const msg =
        parsed.error.errors[0]?.message || 'Data pengukuran tidak valid';
      showAlert('Validasi', msg);
      return;
    }

    setSaving(true);
    try {
      await HapticService.buttonPress();
    } catch {
      // haptic must never block save
    }

    try {
      const row = await syncService.syncToSupabase({
        child_id: child.id,
        height_cm: parsed.data.height_cm,
        weight_kg: parsed.data.weight_kg,
        source: 'manual',
        gender: child.gender,
        date_of_birth: child.date_of_birth,
        measured_at: new Date().toISOString(),
      });

      if (row) {
        const stunting = getStuntingDisplay({
          stunting_risk: row.stunting_risk,
          z_score_hfa: row.z_score_hfa,
          z_score_wfa: row.z_score_wfa,
        });
        const pending = !!(row as { pending_sync?: boolean }).pending_sync;
        try {
          await HapticService.success();
        } catch {
          // ignore
        }
        const body = [
          `Anak: ${child.name}`,
          `Tinggi: ${safeFixed(row.height_cm)} cm`,
          `Berat: ${row.weight_kg != null ? `${safeFixed(row.weight_kg)} kg` : '—'}`,
          `Z-Score TB/U: ${row.z_score_hfa != null ? safeFixed(row.z_score_hfa, 2) : '—'}`,
          `Status: ${stunting?.label ?? '—'}`,
          '',
          pending
            ? 'Z-score dihitung lokal (WHO LMS). Akan otomatis sync ke cloud saat online.'
            : 'Data pengukuran berhasil disimpan.',
        ].join('\n');
        const title = pending ? 'Tersimpan Offline' : 'Pengukuran Tersimpan';
        showAlert(title, body, [
          { text: 'Kembali', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      try {
        await HapticService.medium();
      } catch {
        // ignore
      }
      showAlert(
        'Disimpan Offline',
        'Tidak ada koneksi. Pengukuran masuk antrian sync dan akan dikirim otomatis saat online.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: unknown) {
      try {
        await HapticService.error();
      } catch {
        // ignore
      }
      const message =
        error instanceof Error ? error.message : 'Gagal menyimpan pengukuran';
      showAlert('Gagal Menyimpan', message);
    } finally {
      setSaving(false);
    }
  };

  const weightDisplay = weight.trim() || '—';

  // Circuit breaker: jangan render form saat state anak kosong / sedang bind
  if (binding) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Ukur Manual" onBack={() => navigation.goBack()} />
        <View style={styles.breakerBox}>
          <ActivityIndicator color={colors.primary.main} />
          <Text style={styles.breakerText}>Memuat data anak…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeChild?.id) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Ukur Manual"
          onBack={() => navigation.goBack()}
          subtitle="Belum ada anak aktif"
        />
        <View style={styles.breakerBox}>
          <MaterialCommunityIcons
            name="account-child"
            size={40}
            color={colors.primary.main}
          />
          <Text style={styles.breakerTitle}>Anak belum dipilih</Text>
          <Text style={styles.breakerText}>
            Buka profil anak lalu tekan Ukur Manual agar data terkunci dengan
            benar.
          </Text>
          <View style={styles.inlineBtn}>
            <Button
              title="Pilih Anak"
              onPress={() => navigation.navigate('Children')}
              size="medium"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Ukur Manual"
        onBack={() => navigation.goBack()}
        subtitle={`${activeChild.name} · ${ageLabelFromDob(activeChild.date_of_birth)}`}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.phaseLabel}>
          Measurement for{' '}
          <Text style={styles.phaseName}>{activeChild.name}</Text>
        </Text>

        <Animated.View entering={FadeInDown.duration(500)}>
          <Card variant="elevated" padding="large" style={styles.weightCard}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <View style={styles.weightDisplayRow}>
              <TextInput
                style={styles.weightInput}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={(t) => {
                  setWeight(t);
                  setIsAutoFilled(false);
                }}
                editable={!saving}
                placeholderTextColor={colors.text.disabled}
              />
              <Text style={styles.unitAccent}>kg</Text>
            </View>
            {isAutoFilled ? (
              <View style={styles.autoBadge}>
                <MaterialCommunityIcons
                  name="sync"
                  size={14}
                  color={colors.status.success}
                />
                <Text style={styles.autoFillBadge}>Auto-filled dari IoT</Text>
              </View>
            ) : (
              <Text style={styles.hintMuted}>Opsional — isi jika tersedia</Text>
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <Card variant="elevated" padding="large">
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <View style={styles.heightField}>
              <TextInput
                style={styles.heightInput}
                placeholder="00.0"
                keyboardType="decimal-pad"
                value={height}
                onChangeText={(t) => {
                  setHeight(t);
                  setIsAutoFilled(false);
                }}
                editable={!saving}
                placeholderTextColor={colors.text.disabled}
              />
              <Text style={styles.heightUnit}>cm</Text>
            </View>
            <View style={styles.tipChip}>
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={colors.primary.main}
              />
              <Text style={styles.tipChipText}>Use standing stadiometer</Text>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={colors.primary.main}
            />
            <Text style={styles.bentoLabel}>Status</Text>
            <Text style={styles.bentoValue}>
              {isAutoFilled ? 'IoT sync' : 'Manual'}
            </Text>
          </View>
          <View style={styles.bentoCard}>
            <MaterialCommunityIcons
              name="trending-up"
              size={22}
              color={colors.tertiary.main}
            />
            <Text style={styles.bentoLabel}>Berat</Text>
            <Text style={styles.bentoValue}>{weightDisplay}</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card variant="outlined" padding="large">
            <View style={styles.tipsHead}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={colors.primary.main}
              />
              <Text style={styles.infoTitle}>Tips</Text>
            </View>
            <Text style={styles.infoDesc}>
              Tinggi & berat dihitung otomatis menurut standar WHO. Jika offline,
              pengukuran masuk antrian sync otomatis.
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.buttonGroup}>
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator color={colors.primary.main} />
              <Text style={styles.savingText}>Menyimpan…</Text>
            </View>
          ) : (
            <Button
              title="Simpan Pengukuran"
              onPress={() => {
                void handleSave();
              }}
              size="large"
              fullWidth
            />
          )}
          <Button
            title="Kembali"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="large"
            fullWidth
            disabled={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
    gap: spacing.md,
  },
  breakerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  breakerTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
  },
  breakerText: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  phaseLabel: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  phaseName: {
    color: colors.primary.main,
  },
  weightCard: {
    alignItems: 'center',
  },
  inputLabel: {
    ...typography.styles.labelCaps,
    color: colors.secondary.onContainer,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  weightDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    width: '100%',
  },
  weightInput: {
    flex: 1,
    ...typography.styles.displayLg,
    color: colors.text.onSurface,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  unitAccent: {
    ...typography.styles.headlineLgMobile,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  heightField: {
    position: 'relative',
    justifyContent: 'center',
  },
  heightInput: {
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingRight: 64,
    ...typography.styles.headlineLgMobile,
    color: colors.primary.main,
  },
  heightUnit: {
    position: 'absolute',
    right: spacing.lg,
    ...typography.styles.headlineLgMobile,
    color: colors.secondary.onContainer,
    opacity: 0.4,
  },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.element,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(182, 0, 89, 0.1)',
    borderRadius: borderRadius.full,
  },
  tipChipText: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.primary.main,
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  autoFillBadge: {
    ...typography.styles.labelCaps,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.status.success,
  },
  hintMuted: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
    gap: spacing.xs,
  },
  bentoLabel: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.secondary.onContainer,
  },
  bentoValue: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  tipsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  infoDesc: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  inlineBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 56,
  },
  savingText: {
    ...typography.styles.bodyMd,
    color: colors.primary.main,
  },
});
