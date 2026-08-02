/**
 * Onboarding — 5 slide dari desainuiux.md (gambar lokal + Lanjut → Login)
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface OnboardingScreenProps {
  onFinish: () => void;
}

type Slide = {
  key: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
  badge: string;
  imageMode?: 'cover' | 'contain';
};

const SLIDES: Slide[] = [
  {
    key: 'growth',
    title: 'Pantau Pertumbuhan Bayi',
    body: 'Lacak berat, tinggi, dan lingkar kepala dengan standar WHO — mudah dipakai orang tua di rumah.',
    image: require('../../assets/images/onboarding/01-growth.jpg'),
    badge: 'PEMANTAUAN',
    imageMode: 'cover',
  },
  {
    key: 'iot',
    title: 'Ukur dengan Alat Pintar',
    body: 'Sambungkan alat BabyGrow lewat Bluetooth. Angka tinggi & berat muncul otomatis di HP Anda.',
    image: require('../../assets/images/onboarding/02-iot-scale.jpg'),
    badge: 'ALAT PINTAR',
    imageMode: 'contain',
  },
  {
    key: 'ai',
    title: 'Deteksi AI & Nutrisi',
    body: 'Bantuan AI untuk risiko stunting, plus resep MBG dengan cara memasak langkah demi langkah.',
    image: require('../../assets/images/onboarding/03-ai-nutrition.jpg'),
    badge: 'AI & GIZI',
    imageMode: 'cover',
  },
  {
    key: 'chart',
    title: 'Grafik & Standar WHO',
    body: 'Lihat tren pertumbuhan anak dibanding standar WHO. Insight jelas, tanpa istilah rumit.',
    image: require('../../assets/images/onboarding/04-growth-chart.jpg'),
    badge: 'GRAFIK WHO',
    imageMode: 'cover',
  },
  {
    key: 'start',
    title: 'Siap Mulai?',
    body: 'Daftar sebagai orang tua, atau masuk jika sudah punya akun. Petugas memakai akun dari fasilitas kesehatan.',
    image: require('../../assets/images/onboarding/05-meals.jpg'),
    badge: 'MULAI',
    imageMode: 'cover',
  },
];

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const slideWidth =
    layoutWidth > 0 ? layoutWidth : Math.max(320, Math.round(windowWidth));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setLayoutWidth(w);
  }, []);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!slideWidth) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    setIndex(Math.max(0, Math.min(i, SLIDES.length - 1)));
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    } else {
      onFinish();
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>BabyGrow</Text>
        {!isLast ? (
          <TouchableOpacity onPress={onFinish} hitSlop={12}>
            <Text style={styles.skip}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <MaterialCommunityIcons
            name="heart-cog"
            size={28}
            color={colors.primary.main}
          />
        )}
      </View>

      <View style={styles.listWrap} onLayout={onLayout}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          keyExtractor={(item) => item.key}
          getItemLayout={(_, i) => ({
            length: slideWidth,
            offset: slideWidth * i,
            index: i,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 80);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: slideWidth }]}>
              <View style={styles.visual}>
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode={item.imageMode ?? 'cover'}
                />
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.cta}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isLast ? 'Masuk ke Login' : 'Lanjut'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.credit}>Created by Tio 2026</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  brand: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: typography.letterSpacing.display,
    color: colors.primary.main,
  },
  skip: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
  },
  listWrap: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  visual: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: colors.background.paper,
    marginBottom: spacing.xl,
    ...shadows.diffusion,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(182, 0, 89, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  badgeText: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(182, 0, 89, 0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.main,
  },
  cta: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadows.primaryGlow,
  },
  ctaText: {
    ...typography.styles.buttonText,
    color: colors.text.inverse,
  },
  credit: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
