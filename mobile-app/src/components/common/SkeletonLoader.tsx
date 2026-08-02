/**
 * Skeleton Loading Component
 * 3D Card Skeleton untuk loading state yang profesional
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {colors, spacing, borderRadius, shadows} from '../../theme';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'profile' | 'stat';
  count?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  style,
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard style={animatedStyle} />;
      case 'list':
        return <SkeletonList style={animatedStyle} />;
      case 'profile':
        return <SkeletonProfile style={animatedStyle} />;
      case 'stat':
        return <SkeletonStat style={animatedStyle} />;
      default:
        return <SkeletonCard style={animatedStyle} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.item}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
};

// Skeleton Card (Child Profile Card)
const SkeletonCard: React.FC<{ style: any }> = ({ style }) => (
  <Animated.View style={[styles.card, style]}>
    <LinearGradient
      colors={[colors.surface.low, colors.surface.mid, colors.surface.low]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar} />
        <View style={styles.cardInfo}>
          <View style={[styles.line, { width: '60%' }]} />
          <View style={[styles.line, { width: '40%', marginTop: 8 }]} />
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <View style={[styles.line, { width: 40 }]} />
          <View style={[styles.line, { width: 60, marginTop: 8 }]} />
        </View>
        <View style={styles.statItem}>
          <View style={[styles.line, { width: 40 }]} />
          <View style={[styles.line, { width: 60, marginTop: 8 }]} />
        </View>
        <View style={styles.statItem}>
          <View style={[styles.line, { width: 40 }]} />
          <View style={[styles.line, { width: 60, marginTop: 8 }]} />
        </View>
      </View>
    </LinearGradient>
  </Animated.View>
);

// Skeleton List Item
const SkeletonList: React.FC<{ style: any }> = ({ style }) => (
  <Animated.View style={[styles.listItem, style]}>
    <View style={styles.listAvatar} />
    <View style={styles.listInfo}>
      <View style={[styles.line, { width: '70%' }]} />
      <View style={[styles.line, { width: '50%', marginTop: 8 }]} />
    </View>
  </Animated.View>
);

// Skeleton Profile
const SkeletonProfile: React.FC<{ style: any }> = ({ style }) => (
  <Animated.View style={[styles.profile, style]}>
    <View style={styles.profileAvatar} />
    <View style={[styles.line, { width: 120, marginTop: 16 }]} />
    <View style={[styles.line, { width: 80, marginTop: 8 }]} />
  </Animated.View>
);

// Skeleton Stat Card
const SkeletonStat: React.FC<{ style: any }> = ({ style }) => (
  <Animated.View style={[styles.statCard, style]}>
    <View style={styles.statIcon} />
    <View style={[styles.line, { width: 60, marginTop: 12 }]} />
    <View style={[styles.line, { width: 80, marginTop: 8 }]} />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  item: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.highest,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  line: {
    height: 12,
    backgroundColor: colors.surface.highest,
    borderRadius: borderRadius.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.surface.highest,
    marginVertical: spacing.md,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.md,
    padding: spacing.element,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface.highest,
    marginRight: spacing.element,
  },
  listInfo: {
    flex: 1,
  },
  profile: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.highest,
  },
  statCard: {
    backgroundColor: colors.surface.low,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface.highest,
  },
});
