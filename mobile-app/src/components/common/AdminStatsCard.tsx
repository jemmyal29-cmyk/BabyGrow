/**
 * AdminStatsCard — Officer Dashboard metric tile (desainuiux.md)
 * Large white card, icon top-left, label-caps + display-lg value
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import HapticService from '../../services/HapticService';

export interface AdminStatsCardProps {
  /** MaterialCommunityIcons name */
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: number | string;
  accentColor?: string;
  iconBg?: string;
  subtitle?: string;
  emphasize?: boolean;
  onPress?: () => void;
}

export function AdminStatsCard({
  icon,
  label,
  value,
  accentColor = colors.text.onSurface,
  iconBg,
  subtitle,
  emphasize = false,
  onPress,
}: AdminStatsCardProps) {
  const tint = emphasize ? colors.primary.main : accentColor;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.pressed : null,
      ]}
      onPress={async () => {
        if (!onPress) return;
        await HapticService.light();
        onPress();
      }}
      disabled={!onPress}
    >
      {emphasize ? <View style={styles.glowOrb} pointerEvents="none" /> : null}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                iconBg ??
                (emphasize ? 'rgba(182, 0, 89, 0.1)' : 'rgba(94, 94, 94, 0.08)'),
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={emphasize ? colors.primary.main : colors.text.secondary}
          />
        </View>
        {onPress ? (
          <MaterialCommunityIcons
            name="arrow-top-right"
            size={20}
            color={colors.text.disabled}
          />
        ) : null}
      </View>
      <View style={styles.bottom}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: tint }]}>{value}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 168,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.diffusion,
  },
  pressed: { opacity: 0.9, transform: [{ translateY: -2 }] },
  glowOrb: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.main,
    opacity: 0.06,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.letterSpacing.display,
  },
  subtitle: {
    ...typography.styles.labelCaps,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.text.tertiary,
    marginTop: 4,
  },
});

export default AdminStatsCard;
