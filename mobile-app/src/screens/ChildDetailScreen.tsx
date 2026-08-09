/**
 * Child Detail — data real dari children + useLatestMeasurement
 * Visual: Toddler Profile (desainuiux.md)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import {
  Button,
  LiveMeasurementModal,
  ScreenHeader,
} from '../components/common';
import {
  getStuntingDisplay,
  useLatestMeasurement,
} from '../hooks/useMeasurements';
import { ageLabelFromDob, CHILDREN_QUERY_KEY } from '../hooks/useChildren';
import { supabase } from '../services/SupabaseClient';
import type { ChildRow } from '../types/database';
import HapticService from '../services/HapticService';
import {
  loadParentalMetrics,
  parseBlood,
} from '../utils/parentalMetricsStorage';
import {
  buildParentalInsight,
  estimatedHealthyWeightKg,
} from '../utils/parentalGrowth';

interface ChildDetailScreenProps {
  navigation: any;
  route: any;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MeasurementCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.mCard}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={colors.primary.main}
      />
      <Text style={styles.mLabel}>{label}</Text>
      <Text style={styles.mValue}>{value}</Text>
    </View>
  );
}

function zBarWidth(z: number | null | undefined): `${number}%` {
  if (z == null) return '50%';
  const pct = Math.max(5, Math.min(95, ((z + 3) / 6) * 100));
  return `${pct}%`;
}

export default function ChildDetailScreen({
  navigation,
  route,
}: ChildDetailScreenProps) {
  const [liveMeasurementModalVisible, setLiveMeasurementModalVisible] =
    useState(false);
  const [parentalSummary, setParentalSummary] = useState<string | null>(null);
  const [weightHint, setWeightHint] = useState<string | null>(null);

  const childId: string | undefined =
    route?.params?.childId ?? route?.params?.child?.id;

  const childQuery = useQuery({
    queryKey: [...CHILDREN_QUERY_KEY, 'detail', childId ?? 'none'],
    enabled: !!childId,
    queryFn: async (): Promise<ChildRow | null> => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return {
        ...(data as ChildRow),
        name: String(row.name ?? row.full_name ?? ''),
        date_of_birth: String(row.date_of_birth ?? row.birth_date ?? ''),
      };
    },
  });

  const { data: latest, isPending: latestLoading } =
    useLatestMeasurement(childId);

  const child = childQuery.data;
  const stunting = useMemo(
    () =>
      getStuntingDisplay({
        stunting_risk: latest?.stunting_risk,
        z_score_hfa: latest?.z_score_hfa,
        z_score_wfa: latest?.z_score_wfa,
      }),
    [latest]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!childId || !child) {
        setParentalSummary(null);
        return;
      }
      const metrics = await loadParentalMetrics(childId);
      if (cancelled) return;
      // Utamakan data cloud; fallback AsyncStorage lama
      const fromDb = {
        motherHeightCm: child.mother_height_cm ?? undefined,
        fatherHeightCm: child.father_height_cm ?? undefined,
        motherWeightKg: child.mother_weight_kg ?? undefined,
        fatherWeightKg: child.father_weight_kg ?? undefined,
        motherBlood: parseBlood(child.mother_blood ?? ''),
        fatherBlood: parseBlood(child.father_blood ?? ''),
        childBlood: parseBlood(child.child_blood ?? ''),
      };
      const hasDb =
        fromDb.motherHeightCm != null ||
        fromDb.fatherHeightCm != null ||
        !!fromDb.motherBlood ||
        !!fromDb.fatherBlood;
      const combined = hasDb ? fromDb : metrics;
      if (combined) {
        const insight = buildParentalInsight(child.gender, combined);
        setParentalSummary(insight?.summary ?? null);
      } else {
        setParentalSummary(null);
      }
      if (latest?.height_cm) {
        const w = estimatedHealthyWeightKg(Number(latest.height_cm));
        setWeightHint(
          `Perkiraan berat sehat untuk tinggi ${Number(latest.height_cm).toFixed(1)} cm: sekitar ${w.low}–${w.high} kg (acuan kasar, bukan diagnosis).`
        );
      } else {
        setWeightHint(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId, child, latest?.height_cm]);

  if (!childId) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Detail Anak" onBack={() => navigation.goBack()} />
        <Text style={styles.empty}>Anak tidak ditemukan.</Text>
      </SafeAreaView>
    );
  }

  if (childQuery.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Detail Anak" onBack={() => navigation.goBack()} />
        <ActivityIndicator
          color={colors.primary.main}
          style={{ marginTop: spacing.section }}
        />
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Detail Anak" onBack={() => navigation.goBack()} />
        <Text style={styles.empty}>Data anak tidak tersedia.</Text>
      </SafeAreaView>
    );
  }

  const genderLabel = child.gender === 'female' ? 'Perempuan' : 'Laki-laki';
  const age = ageLabelFromDob(child.date_of_birth);
  const dobLabel = new Date(child.date_of_birth).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Profil Anak"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={async () => {
              await HapticService.buttonPress();
              navigation.navigate('EditChildProfile', {
                childId: child.id,
                child,
              });
            }}
            hitSlop={12}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={22}
              color={colors.primary.main}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name={child.gender === 'female' ? 'face-woman' : 'face-man'}
              size={48}
              color={colors.primary.main}
            />
          </View>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childInfo}>
            {genderLabel} · {age}
          </Text>
          {stunting ? (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${stunting.color}22` },
              ]}
            >
              <Text style={[styles.statusText, { color: stunting.color }]}>
                {stunting.label}
              </Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <Text style={styles.statusTextMuted}>Belum ada pengukuran</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons
              name="badge-account"
              size={20}
              color={colors.primary.main}
            />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Identitas
            </Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow label="Nama Lengkap" value={child.name} />
            <InfoRow label="Jenis Kelamin" value={genderLabel} />
            <InfoRow label="Tanggal Lahir" value={dobLabel} />
            <InfoRow label="Usia Saat Ini" value={age} />
            {child.birth_weight != null ? (
              <InfoRow
                label="Berat Lahir"
                value={`${Number(child.birth_weight).toFixed(2)} kg`}
              />
            ) : null}
            {child.birth_height != null ? (
              <InfoRow
                label="Tinggi Lahir"
                value={`${Number(child.birth_height).toFixed(1)} cm`}
              />
            ) : null}
          </View>
        </View>

        {(parentalSummary || weightHint) && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <MaterialCommunityIcons
                name="calculator-variant"
                size={20}
                color={colors.primary.main}
              />
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                Perhitungan Orang Tua
              </Text>
            </View>
            <View style={styles.infoCard}>
              {parentalSummary ? (
                <Text style={styles.emptyInline}>{parentalSummary}</Text>
              ) : null}
              {weightHint ? (
                <Text style={[styles.emptyInline, { marginTop: spacing.sm }]}>
                  {weightHint}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengukuran Terakhir</Text>
          {latestLoading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : !latest ? (
            <Text style={styles.emptyInline}>Belum ada pengukuran</Text>
          ) : (
            <>
              <View style={styles.measurementGrid}>
                <MeasurementCard
                  icon="scale-bathroom"
                  label="Berat Badan"
                  value={
                    latest.weight_kg != null
                      ? `${Number(latest.weight_kg).toFixed(1)} kg`
                      : '—'
                  }
                />
                <MeasurementCard
                  icon="human-male-height"
                  label="Tinggi Badan"
                  value={`${Number(latest.height_cm).toFixed(1)} cm`}
                />
              </View>
              <View style={styles.measurementCard}>
                <MaterialCommunityIcons
                  name="head"
                  size={22}
                  color={colors.primary.main}
                />
                <View style={styles.measurementInfo}>
                  <Text style={styles.measurementLabel}>Lingkar Kepala</Text>
                  <Text style={styles.measurementValue}>
                    {latest.head_circumference_cm != null
                      ? `${Number(latest.head_circumference_cm).toFixed(1)} cm`
                      : '—'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Pertumbuhan (WHO)</Text>
          <View style={styles.growthCard}>
            {!latest ? (
              <Text style={styles.emptyInline}>Belum ada pengukuran</Text>
            ) : (
              <>
                <View style={styles.growthHeader}>
                  <Text style={styles.growthTitle}>Analisis WHO</Text>
                  <View
                    style={[
                      styles.growthBadge,
                      stunting
                        ? { backgroundColor: `${stunting.color}22` }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.growthBadgeText,
                        stunting ? { color: stunting.color } : null,
                      ]}
                    >
                      {stunting?.label ?? '—'}
                    </Text>
                  </View>
                </View>

                {(
                  [
                    ['BB/U', latest.z_score_wfa],
                    ['TB/U', latest.z_score_hfa],
                    ['BB/TB', latest.z_score_wfh],
                  ] as const
                ).map(([label, z]) => (
                  <View key={label} style={styles.zScoreRow}>
                    <Text style={styles.zScoreLabel}>{label}</Text>
                    <View style={styles.zScoreBar}>
                      <View
                        style={[
                          styles.zScoreFill,
                          {
                            width: zBarWidth(z),
                            backgroundColor:
                              stunting?.color ?? colors.status.success,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.zScoreValue}>
                      {z != null ? Number(z).toFixed(2) : '—'}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Lahir</Text>
          <View style={styles.infoCard}>
            <InfoRow
              label="Berat Lahir"
              value={
                child.birth_weight != null
                  ? `${Number(child.birth_weight).toFixed(2)} kg`
                  : '—'
              }
            />
            <InfoRow
              label="Tinggi Lahir"
              value={
                child.birth_height != null
                  ? `${Number(child.birth_height).toFixed(1)} cm`
                  : '—'
              }
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Ukur Manual"
            onPress={() =>
              navigation.navigate('ManualMeasurement', { childId: child.id })
            }
            variant="secondary"
            size="large"
            style={{ flex: 1 }}
            fullWidth={false}
          />
          <Button
            title="Lihat Grafik"
            onPress={() =>
              navigation.navigate('GrowthChart', { childId: child.id })
            }
            size="large"
            style={{ flex: 1 }}
            fullWidth={false}
            icon={
              <MaterialCommunityIcons
                name="chart-line"
                size={18}
                color={colors.primary.onPrimary}
              />
            }
          />
        </View>
      </ScrollView>

      <LiveMeasurementModal
        visible={liveMeasurementModalVisible}
        onClose={() => setLiveMeasurementModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 90,
  },
  profileCard: { alignItems: 'center', marginBottom: spacing.section },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackGap,
    borderWidth: 4,
    borderColor: colors.surface.lowest,
    ...shadows.diffusion,
  },
  childName: {
    ...typography.styles.headlineLg,
    color: colors.text.onSurface,
  },
  childInfo: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.mid,
  },
  statusText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  statusTextMuted: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  section: { marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 28, 28, 0.05)',
  },
  infoLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.styles.bodyMd,
    color: colors.text.onSurface,
    maxWidth: '55%',
    textAlign: 'right',
  },
  measurementGrid: { flexDirection: 'row', gap: spacing.sm },
  mCard: {
    flex: 1,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.diffusion,
  },
  mLabel: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.text.secondary,
  },
  mValue: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
  },
  measurementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.diffusion,
  },
  measurementInfo: { flex: 1 },
  measurementLabel: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.text.secondary,
  },
  measurementValue: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  growthCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  growthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  growthTitle: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  growthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.mid,
  },
  growthBadgeText: {
    ...typography.styles.labelCaps,
    fontSize: 10,
  },
  zScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  zScoreLabel: {
    width: 48,
    ...typography.styles.labelCaps,
    fontSize: 10,
    color: colors.text.secondary,
  },
  zScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface.mid,
    borderRadius: borderRadius.DEFAULT,
    overflow: 'hidden',
  },
  zScoreFill: { height: '100%', borderRadius: borderRadius.DEFAULT },
  zScoreValue: {
    width: 44,
    textAlign: 'right',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.text.onSurface,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.section,
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  emptyInline: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
