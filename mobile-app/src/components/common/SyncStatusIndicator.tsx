/**
 * SyncStatusIndicator — real-time Supabase sync badge (offline queue + NetInfo)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import {colors, typography, spacing, borderRadius} from '../../theme';
import HapticService from '../../services/HapticService';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import type { SyncVisualStatus } from '../../store/syncStore';

const STATUS_COLOR: Record<SyncVisualStatus, string> = {
  synced: colors.status.success,
  syncing: colors.stunting.stunted, // warning orange
  offline: colors.neutral.gray400,
};

const STATUS_ICON: Record<SyncVisualStatus, string> = {
  synced: '✓',
  syncing: '↻',
  offline: '○',
};

export interface SyncStatusIndicatorProps {
  compact?: boolean;
}

export function SyncStatusIndicator({ compact = false }: SyncStatusIndicatorProps) {
  const { status, label, queueLength, retry } = useSyncStatus();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (status === 'syncing') {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [status, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const color = STATUS_COLOR[status];

  const onPress = async () => {
    await HapticService.light();
    if (status === 'syncing' || status === 'offline') {
      await retry();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${label}`}
      hitSlop={8}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: color, backgroundColor: `${color}14` },
        pressed && styles.pressed,
      ]}
    >
      <Animated.View style={[styles.iconWrap, status === 'syncing' && spinStyle]}>
        <Text style={[styles.icon, { color }]}>{STATUS_ICON[status]}</Text>
      </Animated.View>
      {!compact ? (
        <View style={styles.textCol}>
          <Text style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </Text>
          {status === 'syncing' && queueLength > 0 ? (
            <Text style={styles.queueHint}>{queueLength} pending</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
    maxWidth: 140,
  },
  pressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 18,
  },
  textCol: {
    flexShrink: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    lineHeight: 16,
    fontWeight: typography.fontWeight.semibold,
  },
  queueHint: {
    fontSize: typography.fontSize.xs,
    lineHeight: 12,
    color: colors.text.secondary,
    marginTop: -1,
  },
});

export default SyncStatusIndicator;
