/**
 * Children Screen — Daftar Balita (desainuiux.md Glamorism)
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth, useIsAdmin } from '../store/authStore';
import { ageLabelFromDob, useChildren } from '../hooks/useChildren';
import { ScreenHeader } from '../components/common';
import HapticService from '../services/HapticService';
import { useChildStore } from '../store/childStore';

type Filter = 'all' | 'warning' | 'normal' | 'newest';

export default function ChildrenScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const setActiveChild = useChildStore((s) => s.setActiveChild);

  const { data: children = [], isLoading, isError, error, refetch, isRefetching } =
    useChildren(isAdmin ? { fetchAll: true } : { parentId: user?.id });

  const filtered = useMemo(() => {
    let list = [...children];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filter === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.created_at || b.date_of_birth).getTime() -
          new Date(a.created_at || a.date_of_birth).getTime()
      );
    }
    return list;
  }, [children, query, filter]);

  const handleAddChild = async () => {
    await HapticService.buttonPress();
    navigation.getParent()?.navigate('AddChild');
  };

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'warning', label: 'Warning' },
    { key: 'normal', label: 'Normal' },
    { key: 'newest', label: 'Terbaru' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={isAdmin ? 'Daftar Balita' : 'Profil Anak'}
        rightAction={
          <Pressable style={styles.fabMini} onPress={handleAddChild} hitSlop={8}>
            <MaterialCommunityIcons name="plus" size={22} color={colors.text.inverse} />
          </Pressable>
        }
      />

      <View style={styles.searchWrap}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.text.secondary}
        />
        <TextInput
          style={styles.search}
          placeholder="Cari nama…"
          placeholderTextColor={colors.text.disabled}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <Pressable
              key={c.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={async () => {
                await HapticService.light();
                setFilter(c.key);
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary.main}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator
            color={colors.primary.main}
            style={{ marginTop: spacing.xl }}
          />
        ) : null}

        {isError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Gagal memuat data</Text>
            <Text style={styles.emptyDesc}>{(error as Error)?.message}</Text>
            <Pressable style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !isError && filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="baby-face-outline"
              size={40}
              color={colors.primary.main}
            />
            <Text style={styles.emptyTitle}>Belum ada data anak</Text>
            <Text style={styles.emptyDesc}>
              Tambahkan profil anak untuk mulai menyimpan pengukuran.
            </Text>
            <Pressable style={styles.retryBtn} onPress={handleAddChild}>
              <Text style={styles.retryText}>Tambah Anak</Text>
            </Pressable>
          </View>
        ) : null}

        {filtered.map((child) => (
          <Pressable
            key={child.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
            onPress={async () => {
              await HapticService.light();
              setActiveChild({
                id: child.id,
                name: child.name,
                gender: child.gender,
                date_of_birth: child.date_of_birth,
              });
              navigation
                .getParent()
                ?.navigate('ChildDetail', { childId: child.id });
            }}
          >
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons
                  name={child.gender === 'female' ? 'face-woman' : 'face-man'}
                  size={24}
                  color={colors.primary.main}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{child.name}</Text>
                <Text style={styles.meta}>
                  {child.gender === 'female' ? 'Perempuan' : 'Laki-laki'} ·{' '}
                  {ageLabelFromDob(child.date_of_birth)}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                style={styles.iconBtn}
                onPress={async () => {
                  await HapticService.buttonPress();
                  navigation
                    .getParent()
                    ?.navigate('GrowthChart', { childId: child.id });
                }}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={20}
                  color={colors.primary.main}
                />
              </Pressable>
              <Pressable
                style={[styles.iconBtn, styles.iconBtnPrimary]}
                onPress={async () => {
                  await HapticService.buttonPress();
                  setActiveChild({
                    id: child.id,
                    name: child.name,
                    gender: child.gender,
                    date_of_birth: child.date_of_birth,
                  });
                  navigation
                    .getParent()
                    ?.navigate('ManualMeasurement', { childId: child.id });
                }}
              >
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={20}
                  color={colors.text.inverse}
                />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={handleAddChild}>
        <MaterialCommunityIcons name="plus" size={32} color={colors.text.inverse} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  fabMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
  searchWrap: {
    marginHorizontal: spacing.containerPadding,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.diffusion,
  },
  search: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.onSurface,
    padding: 0,
  },
  chips: {
    paddingHorizontal: spacing.containerPadding,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary.main,
  },
  chipText: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 100,
    gap: spacing.stackGap,
  },
  emptyCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.diffusion,
  },
  emptyTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: typography.fontSize.lg,
    color: colors.text.onSurface,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  retryText: {
    ...typography.styles.buttonText,
    color: colors.text.inverse,
  },
  card: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.diffusion,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  meta: {
    ...typography.styles.labelCaps,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.text.secondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPrimary: {
    backgroundColor: colors.primary.main,
  },
  fab: {
    position: 'absolute',
    right: spacing.containerPadding,
    bottom: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
});
