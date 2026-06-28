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
      colors={['#F5F5F5', '#EEEEEE', '#F5F5F5']}
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
    padding: 16,
  },
  item: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  line: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  profile: {
    alignItems: 'center',
    padding: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
  },
  statCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
  },
});
