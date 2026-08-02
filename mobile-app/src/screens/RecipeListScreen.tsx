/**
 * Recipe List — MBG dengan bahan lengkap + langkah memasak detail
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button, ScreenHeader } from '../components/common';
import { useRecipes, type RecipeRow } from '../hooks/useRecipes';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import HapticService from '../services/HapticService';

const CATEGORY_LABEL: Record<string, string> = {
  breakfast: 'Sarapan',
  lunch: 'Makan Siang',
  dinner: 'Makan Malam',
  snack: 'Cemilan',
};

/** Perluas langkah singkat jadi panduan lebih ramah pemula */
function expandSteps(recipe: RecipeRow): string[] {
  const base = [...(recipe.instructions ?? [])];
  const tips: string[] = [
    'Cuci tangan dan semua bahan sebelum memasak.',
    'Pastikan tekstur sesuai usia: 6–8 bln halus, 9–12 bln cincang lembut, >12 bln bisa lebih kasar.',
    'Sajikan hangat. Simpan sisa di kulkas maks. 24 jam; jangan dipanaskan berulang.',
  ];
  if (recipe.is_high_protein) {
    tips.push(
      'Sumber protein penting untuk cegah stunting — pastikan ayam/ikan/telur matang sempurna.'
    );
  }
  if (recipe.age_min_months < 12) {
    tips.push('Hindari garam, gula, dan madu untuk bayi di bawah 12 bulan.');
  }
  return [...base, ...tips];
}

function RecipeCard({
  recipe,
  index,
}: {
  recipe: RecipeRow;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const steps = expandSteps(recipe);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={async () => {
          await HapticService.light();
          setOpen((v) => !v);
        }}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={20}
              color={colors.primary.main}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.meta}>
              {CATEGORY_LABEL[recipe.category] ?? recipe.category} ·{' '}
              {recipe.calories} kcal · {recipe.protein_g}g protein
            </Text>
            <Text style={styles.metaAge}>
              Usia {recipe.age_min_months}–{recipe.age_max_months} bulan
              {recipe.is_mbg_eligible ? ' · Program MBG' : ''}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.primary.main}
          />
        </View>

        {open ? (
          <View style={styles.detail}>
            <Text style={styles.sectionLabel}>Bahan-bahan</Text>
            {(recipe.ingredients ?? []).map((ing, i) => (
              <View key={`${ing}-${i}`} style={styles.bulletRow}>
                <Text style={styles.bulletNum}>{i + 1}.</Text>
                <Text style={styles.bullet}>{ing}</Text>
              </View>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>
              Cara membuat
            </Text>
            {steps.map((step, i) => (
              <View key={`step-${i}`} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <View style={styles.nutriBox}>
              <Text style={styles.nutriTitle}>Nilai gizi (perkiraan porsi)</Text>
              <Text style={styles.nutriLine}>
                Kalori {recipe.calories} · Protein {recipe.protein_g}g
                {recipe.fat_g != null ? ` · Lemak ${recipe.fat_g}g` : ''}
                {recipe.carbs_g != null ? ` · Karbo ${recipe.carbs_g}g` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.tapHint}>Ketuk untuk melihat cara memasak lengkap</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function RecipeListScreen({ navigation }: any) {
  const { data: recipes = [], isPending, isError, error, refetch, isFetching } =
    useRecipes();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Resep MBG"
        subtitle="Bahan + cara memasak langkah demi langkah"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={refetch}
            tintColor={colors.primary.main}
          />
        }
      >
        {isPending ? (
          <ActivityIndicator
            color={colors.primary.main}
            style={{ marginTop: 24 }}
          />
        ) : isError ? (
          <Card variant="elevated" padding="large">
            <Text style={styles.error}>
              {error instanceof Error ? error.message : 'Gagal memuat resep'}
            </Text>
            <Button title="Coba lagi" onPress={() => refetch()} size="medium" />
          </Card>
        ) : recipes.length === 0 ? (
          <Card variant="elevated" padding="large">
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={32}
              color={colors.primary.main}
              style={{ alignSelf: 'center', marginBottom: spacing.sm }}
            />
            <Text style={styles.empty}>
              Belum ada resep tersedia. Coba muat ulang atau hubungi petugas.
            </Text>
          </Card>
        ) : (
          recipes.map((r, index) => (
            <RecipeCard key={r.id} recipe={r} index={index} />
          ))
        )}

        <Button
          title="Kembali"
          onPress={async () => {
            await HapticService.buttonPress();
            navigation.goBack();
          }}
          variant="secondary"
          size="large"
          fullWidth
        />
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
    gap: spacing.md,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.lg,
    color: colors.text.onSurface,
    marginBottom: 2,
  },
  meta: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  metaAge: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  tapHint: {
    marginTop: spacing.sm,
    ...typography.styles.labelCaps,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.primary.main,
  },
  detail: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.divider,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  bulletNum: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.primary.main,
    fontFamily: typography.fontFamily.bold,
    width: 20,
  },
  bullet: {
    flex: 1,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
  },
  stepText: {
    flex: 1,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  nutriBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary.fixed,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  nutriTitle: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
    marginBottom: 4,
  },
  nutriLine: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
  },
  empty: {
    textAlign: 'center',
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  error: {
    color: colors.status.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    ...typography.styles.bodyMd,
  },
});
