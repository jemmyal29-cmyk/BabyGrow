/**
 * BabyGrow Card — Atomic Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}) => {
  const paddingKey = `padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}` as
    | 'paddingNone'
    | 'paddingSmall'
    | 'paddingMedium'
    | 'paddingLarge';

  const cardStyle = [styles.card, styles[variant], styles[paddingKey], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
  },

  default: {
    ...shadows.soft,
  },
  elevated: {
    ...shadows.card,
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
  paddingSmall: { padding: spacing.sm },
  paddingMedium: { padding: spacing.md },
  paddingLarge: { padding: spacing.lg },
});

export default Card;
