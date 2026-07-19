/**
 * Children Screen — Supabase via React Query
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../store/authStore';
import { useIsAdmin } from '../store/authStore';
import { ageLabelFromDob, useChildren } from '../hooks/useChildrenQueries';
import { Button } from '../components/common';

export default function ChildrenScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: children = [], isLoading, isError, error, refetch, isRefetching } =
    useChildren(
      isAdmin
        ? { fetchAll: true }
        : { parentId: user?.id }
    );

  const list = children;

  const handleAddChild = () => {
    navigation.getParent()?.navigate('AddChild');
  };

  const handleChildPress = (child: (typeof list)[number]) => {
    navigation.getParent()?.navigate('ChildDetail', { child });
  };

  const handleGrowthChart = (childId: string) => {
    navigation.getParent()?.navigate('GrowthChart', { childId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isAdmin ? 'Data Balita' : 'Profil Anak'}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
            <Text style={styles.addButtonText}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.xl }} />
        ) : null}

        {isError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Gagal memuat data</Text>
            <Text style={styles.emptyDesc}>{(error as Error)?.message}</Text>
            <Button title="Coba Lagi" onPress={() => refetch()} style={{ marginTop: spacing.md }} />
          </View>
        ) : null}

        {!isLoading && !isError && list.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>Belum ada data anak</Text>
            <Text style={styles.emptyDesc}>
              Tambahkan profil anak untuk mulai menyimpan pengukuran ke Supabase.
            </Text>
            <Button title="Tambah Anak" onPress={handleAddChild} style={{ marginTop: spacing.md }} />
          </View>
        ) : null}

        {list.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={styles.card}
            onPress={() => handleChildPress(child)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{child.gender === 'female' ? '👧' : '👦'}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{child.name}</Text>
                <Text style={styles.meta}>
                  {child.gender === 'female' ? 'Perempuan' : 'Laki-laki'} ·{' '}
                  {ageLabelFromDob(child.date_of_birth)}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleGrowthChart(child.id)}
              >
                <Text style={styles.actionText}>Grafik</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionPrimary]}
                onPress={() =>
                  navigation.getParent()?.navigate('ManualMeasurement', { childId: child.id })
                }
              >
                <Text style={[styles.actionText, styles.actionPrimaryText]}>Ukur</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.elevated,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    ...shadows.pink,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semiBold,
    fontSize: typography.fontSize.sm,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.primary.main,
  },
  actionText: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionPrimaryText: {
    color: colors.text.inverse,
  },
  emptyCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.soft,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
