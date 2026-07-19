/**
 * Children Screen — desainuiux.md + Supabase React Query
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { useAuth, useIsAdmin } from '../store/authStore';
import { ageLabelFromDob, useChildren } from '../hooks/useChildren';
import { Button, Card, ScreenHeader } from '../components/common';

export default function ChildrenScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: children = [], isLoading, isError, error, refetch, isRefetching } =
    useChildren(isAdmin ? { fetchAll: true } : { parentId: user?.id });

  const list = children;

  const handleAddChild = () => {
    navigation.getParent()?.navigate('AddChild');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={isAdmin ? 'Data Balita' : 'Profil Anak'}
        subtitle="Data tersinkron ke Supabase"
        rightAction={
          <Button
            title="+ Tambah"
            onPress={handleAddChild}
            size="small"
            fullWidth={false}
            style={styles.addBtn}
          />
        }
      />

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
          <ActivityIndicator color={colors.primary.main} style={{ marginTop: spacing.xl }} />
        ) : null}

        {isError ? (
          <Card>
            <Text style={styles.emptyTitle}>Gagal memuat data</Text>
            <Text style={styles.emptyDesc}>{(error as Error)?.message}</Text>
            <Button title="Coba Lagi" onPress={() => refetch()} style={{ marginTop: spacing.md }} />
          </Card>
        ) : null}

        {!isLoading && !isError && list.length === 0 ? (
          <Card>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>Belum ada data anak</Text>
            <Text style={styles.emptyDesc}>
              Tambahkan profil anak untuk mulai menyimpan pengukuran.
            </Text>
            <Button title="Tambah Anak" onPress={handleAddChild} style={{ marginTop: spacing.md }} />
          </Card>
        ) : null}

        {list.map((child) => (
          <Card
            key={child.id}
            onPress={() => navigation.getParent()?.navigate('ChildDetail', { child })}
            style={styles.card}
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
              <Button
                title="Grafik"
                variant="secondary"
                size="medium"
                fullWidth
                onPress={() =>
                  navigation.getParent()?.navigate('GrowthChart', { childId: child.id })
                }
                style={styles.actionFlex}
              />
              <Button
                title="Ukur"
                size="medium"
                fullWidth
                onPress={() =>
                  navigation.getParent()?.navigate('ManualMeasurement', { childId: child.id })
                }
                style={styles.actionFlex}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.section,
    gap: spacing.stackGap,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  card: {
    marginBottom: spacing.stackGap,
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
  cardInfo: { flex: 1 },
  name: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
  },
  meta: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.element,
  },
  actionFlex: {
    flex: 1,
  },
  emptyEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
