/**
 * Shared dashboard UI atoms — desainuiux.md Officer / Posyandu
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import HapticService from '../../services/HapticService';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function WelcomeHeader({
  name,
  right,
}: {
  name: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={welcome.row}>
      <View style={welcome.textCol}>
        <Text style={welcome.eyebrow}>Welcome Back</Text>
        <Text style={welcome.title}>
          Hello, <Text style={welcome.name}>{name}</Text>
        </Text>
      </View>
      {right ? <View style={welcome.right}>{right}</View> : null}
    </View>
  );
}

const welcome = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
  },
  textCol: { flex: 1, paddingRight: spacing.md },
  eyebrow: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
  },
  name: {
    ...typography.styles.headlineLgMobile,
    color: colors.primary.main,
  },
  right: { marginTop: 2 },
});

export function HeroStatusBanner({
  badge,
  body,
  style,
}: {
  badge: string;
  body: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[hero.wrap, style]}>
      <View style={hero.glow} pointerEvents="none" />
      <View style={hero.badge}>
        <Text style={hero.badgeText}>{badge}</Text>
      </View>
      <Text style={hero.body}>{body}</Text>
    </View>
  );
}

const hero = StyleSheet.create({
  wrap: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'flex-end',
    backgroundColor: colors.primary.fixed,
    overflow: 'hidden',
    marginBottom: spacing.section,
    ...shadows.diffusion,
  },
  glow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary.main,
    opacity: 0.08,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(182, 0, 89, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
  },
  body: {
    ...typography.styles.bodyMd,
    color: colors.text.tertiary,
    maxWidth: 240,
  },
});

export function QuickMenuTile({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        menu.tile,
        primary && menu.tilePrimary,
        pressed && menu.pressed,
      ]}
      onPress={async () => {
        await HapticService.light();
        onPress();
      }}
    >
      <View
        style={[
          menu.iconCircle,
          {
            backgroundColor: primary
              ? 'rgba(182, 0, 89, 0.12)'
              : 'rgba(94, 94, 94, 0.08)',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={primary ? colors.primary.main : colors.text.secondary}
        />
      </View>
      <Text style={menu.label}>{label}</Text>
    </Pressable>
  );
}

const menu = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.element,
    ...shadows.diffusion,
  },
  tilePrimary: {
    borderWidth: 1,
    borderColor: colors.primary.fixedDim,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
    textAlign: 'center',
  },
});

export function RiskPill({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <View style={[pill.wrap, { backgroundColor: `${color}22` }]}>
      <Text style={[pill.text, { color }]}>{label}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  text: {
    ...typography.styles.labelCaps,
    fontSize: 10,
    lineHeight: 14,
  },
});

export function SectionHeading({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={section.row}>
      <Text style={section.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={async () => {
            await HapticService.light();
            onAction();
          }}
          hitSlop={8}
        >
          <Text style={section.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const section = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.stackGap,
    paddingHorizontal: 2,
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
  },
  action: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
  },
});
