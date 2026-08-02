/**
 * Admin Dashboard — Officer Dashboard / Posyandu (desainuiux.md)
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useIsAdmin } from '../store/authStore';
import { SkeletonLoader, SyncStatusIndicator } from '../components/common';
import { AdminStatsCard } from '../components/common/AdminStatsCard';
import {
  WelcomeHeader,
  HeroStatusBanner,
  QuickMenuTile,
  SectionHeading,
  RiskPill,
} from '../components/common/DashboardUI';
import {
  useAdminDashboardStats,
  useFilteredAdminChildren,
  type AdminChildRow,
} from '../hooks/useAdminDashboard';
import {
  runSystemHealthCheck,
  type SystemHealthReport,
  type HealthStatus,
} from '../services/SystemHealthService';
import { exportCsvAndShare } from '../utils/csvExport';
import { ageLabelFromDob } from '../hooks/useChildren';
import HapticService from '../services/HapticService';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const STATUS_COLOR: Record<HealthStatus, string> = {
  ok: colors.status.success,
  warn: colors.status.warning,
  fail: colors.status.error,
};

function riskMeta(risk?: string | null) {
  switch (risk) {
    case 'normal':
      return { label: 'Normal', color: colors.stunting.normal };
    case 'at_risk':
      return { label: 'At Risk', color: colors.stunting.atRisk };
    case 'stunted':
      return { label: 'Stunting', color: colors.stunting.stunted };
    case 'severe':
      return { label: 'Severe', color: colors.stunting.severelyStunted };
    default:
      return { label: 'Belum ukur', color: colors.text.secondary };
  }
}

function formatAgo(iso?: string | null): string {
  if (!iso) return 'Belum ada update';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Baru saja';
    if (h < 24) return `Updated ${h}h ago`;
    const d = Math.floor(h / 24);
    return `Updated ${d}d ago`;
  } catch {
    return '—';
  }
}

export default function AdminDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { width } = useWindowDimensions();
  const pad = spacing.containerPadding;
  const gap = spacing.stackGap;
  const cardW = Math.max(140, (width - pad * 2 - gap) / 2);

  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statsQuery = useAdminDashboardStats(isAdmin);
  const childrenQuery = useFilteredAdminChildren(search, isAdmin);
  const stats = statsQuery.data;

  const heroBadge =
    health?.overall === 'fail'
      ? 'Regional Status: Attention'
      : health?.overall === 'warn'
        ? 'Regional Status: Watch'
        : 'Regional Status: Good';

  const onRefresh = async () => {
    await Promise.all([statsQuery.refetch(), childrenQuery.refetch()]);
  };

  const runHealth = async () => {
    await HapticService.buttonPress();
    setHealthLoading(true);
    try {
      const report = await runSystemHealthCheck();
      setHealth(report);
      if (report.overall === 'ok') await HapticService.success();
      else await HapticService.warning();
    } catch (e) {
      Alert.alert(
        'Health Check Gagal',
        e instanceof Error ? e.message : 'Unknown error'
      );
    } finally {
      setHealthLoading(false);
    }
  };

  const exportCsv = async () => {
    await HapticService.buttonPress();
    const rows = childrenQuery.filtered;
    if (rows.length === 0) {
      Alert.alert('Export', 'Tidak ada data balita untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      await exportCsvAndShare({
        filename: `babygrow-balita-${new Date().toISOString().slice(0, 10)}.csv`,
        headers: [
          'id',
          'name',
          'gender',
          'date_of_birth',
          'parent_name',
          'parent_email',
          'latest_height_cm',
          'latest_weight_kg',
          'latest_risk',
          'latest_measured_at',
        ],
        rows: rows.map((c) => ({
          id: c.id,
          name: c.name,
          gender: c.gender,
          date_of_birth: c.date_of_birth,
          parent_name: c.parent_name ?? '',
          parent_email: c.parent_email ?? '',
          latest_height_cm: c.latest_height ?? '',
          latest_weight_kg: c.latest_weight ?? '',
          latest_risk: c.latest_risk ?? '',
          latest_measured_at: c.latest_measured_at ?? '',
        })),
      });
      await HapticService.success();
    } catch (e) {
      Alert.alert(
        'Export gagal',
        e instanceof Error ? e.message : 'Tidak dapat membagikan CSV'
      );
    } finally {
      setExporting(false);
    }
  };

  const openChild = async (child: AdminChildRow) => {
    await HapticService.buttonPress();
    navigation.navigate('ChildDetail', { childId: child.id });
  };

  const listHeader = useMemo(
    () => (
      <View>
        <Animated.View entering={FadeInDown.duration(400)}>
          <WelcomeHeader
            name={user?.name || 'Petugas'}
            right={
              <View style={styles.notifBtn}>
                <SyncStatusIndicator compact />
              </View>
            }
          />
        </Animated.View>

        <HeroStatusBanner
          badge={heroBadge}
          body={
            health
              ? `System monitoring · ${health.overall.toUpperCase()} · ${user?.location?.puskesmas || 'Puskesmas'}`
              : `System monitoring aktif · ${user?.location?.puskesmas || 'Puskesmas'}`
          }
        />

        {statsQuery.isPending ? (
          <SkeletonLoader variant="stat" count={4} style={{ padding: 0 }} />
        ) : (
          <View style={styles.statsGrid}>
            <View style={{ width: cardW }}>
              <AdminStatsCard
                icon="baby-face-outline"
                label="Total Balita"
                value={stats?.totalChildren ?? 0}
                onPress={() => navigation.navigate('Children')}
              />
            </View>
            <View style={{ width: cardW }}>
              <AdminStatsCard
                icon="alert"
                label="Stunting Risk"
                value={stats?.stuntingCount ?? 0}
                emphasize
                onPress={() => setSearch('')}
              />
            </View>
            <View style={{ width: cardW }}>
              <AdminStatsCard
                icon="ruler"
                label="Ukur Hari Ini"
                value={stats?.measurementsToday ?? 0}
                accentColor={colors.status.info}
              />
            </View>
            <View style={{ width: cardW }}>
              <AdminStatsCard
                icon="alert-circle-outline"
                label="Berisiko"
                value={stats?.atRiskCount ?? 0}
                accentColor={colors.stunting.atRisk}
              />
            </View>
          </View>
        )}

        <SectionHeading title="Quick Menu" />
        <View style={styles.menuGrid}>
          <QuickMenuTile
            icon="account-plus"
            label="Tambah Data"
            primary
            onPress={() => navigation.navigate('AddChild')}
          />
          <QuickMenuTile
            icon="file-export-outline"
            label={exporting ? 'Export…' : 'Export CSV'}
            onPress={exportCsv}
          />
          <QuickMenuTile
            icon="heart-pulse"
            label={healthLoading ? 'Cek…' : 'System Health'}
            onPress={runHealth}
          />
          <QuickMenuTile
            icon="robot-outline"
            label="AI Asisten"
            onPress={() => navigation.navigate('AIAssistant')}
          />
        </View>

        {health ? (
          <View style={styles.healthPanel}>
            <Text style={styles.healthTitle}>
              System Health ·{' '}
              <Text style={{ color: STATUS_COLOR[health.overall] }}>
                {health.overall.toUpperCase()}
              </Text>
            </Text>
            {health.items.map((item) => (
              <View key={item.id} style={styles.healthRow}>
                <View
                  style={[
                    styles.healthDot,
                    { backgroundColor: STATUS_COLOR[item.status] },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.healthLabel}>{item.label}</Text>
                  <Text style={styles.healthDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={styles.seedBanner}>
            <Text style={styles.seedTitle}>Seed Smoke Test</Text>
            <Text style={styles.seedBody}>
              WHO: {stats?.whoStandardsCount ?? '—'} · Resep:{' '}
              {stats?.recipesCount ?? '—'}
            </Text>
          </View>
        ) : null}

        <SectionHeading
          title="Recent Activity"
          actionLabel="View All"
          onAction={() => navigation.navigate('Children')}
        />

        <TextInput
          style={styles.search}
          placeholder="Cari nama anak / orang tua…"
          placeholderTextColor={colors.text.disabled}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
    ),
    [
      user,
      stats,
      statsQuery.isPending,
      health,
      healthLoading,
      exporting,
      search,
      cardW,
      heroBadge,
    ]
  );

  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedText}>Halaman ini khusus untuk petugas.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlashList
        data={childrenQuery.filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={statsQuery.isFetching && !statsQuery.isPending}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={
          childrenQuery.isPending ? (
            <SkeletonLoader variant="list" count={4} />
          ) : (
            <Text style={styles.empty}>Tidak ada balita yang cocok.</Text>
          )
        }
        renderItem={({ item }) => {
          const risk = riskMeta(item.latest_risk);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.childCard,
                pressed && { opacity: 0.92 },
              ]}
              onPress={() => openChild(item)}
            >
              <View style={styles.childLeft}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons
                    name={item.gender === 'female' ? 'face-woman' : 'face-man'}
                    size={22}
                    color={colors.primary.main}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{item.name}</Text>
                  <Text style={styles.childMeta}>
                    {ageLabelFromDob(item.date_of_birth)} ·{' '}
                    {formatAgo(item.latest_measured_at)}
                  </Text>
                  <Text style={styles.childMeta} numberOfLines={1}>
                    {item.parent_name || '—'}
                  </Text>
                </View>
              </View>
              <RiskPill label={risk.label} color={risk.color} />
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.xxl + 72,
  },
  notifBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    ...shadows.diffusion,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackGap,
    marginBottom: spacing.section,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackGap,
    marginBottom: spacing.section,
  },
  healthPanel: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.diffusion,
  },
  healthTitle: {
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.sm,
    color: colors.text.onSurface,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  healthLabel: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.onSurface,
  },
  healthDetail: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  seedBanner: {
    backgroundColor: colors.primary.fixed,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  seedTitle: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary.onFixed,
    marginBottom: 4,
  },
  seedBody: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  search: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    color: colors.text.onSurface,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  childCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.element,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  childLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  childMeta: {
    ...typography.styles.labelCaps,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.text.secondary,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: colors.text.secondary,
    paddingVertical: spacing.xl,
  },
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },
  deniedText: {
    color: colors.status.error,
    fontFamily: typography.fontFamily.semiBold,
  },
});
