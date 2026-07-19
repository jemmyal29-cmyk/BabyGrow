/**
 * Card — Atomic (desainuiux.md)
 * Uniform padding (container/stack) + radius xl (24) + diffusion shadow
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import HapticService from '../../services/HapticService';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  haptic?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'large',
  haptic = true,
}) => {
  const paddingKey = `padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}` as
    | 'paddingNone'
    | 'paddingSmall'
    | 'paddingMedium'
    | 'paddingLarge';

  const cardStyle = [styles.card, styles[variant], styles[paddingKey], style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={async () => {
          if (haptic) await HapticService.buttonPress();
          onPress();
        }}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
  },
  default: {
    ...shadows.soft,
  },
  elevated: {
    ...shadows.diffusion,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  glass: {
    backgroundColor: colors.effects.glassWhite,
    borderWidth: 1,
    borderColor: colors.border.glass,
    ...shadows.soft,
  },
  paddingNone: { padding: 0 },
  paddingSmall: { padding: spacing.element },
  paddingMedium: { padding: spacing.stackGap },
  paddingLarge: { padding: spacing.containerPadding },
});

export default Card;
