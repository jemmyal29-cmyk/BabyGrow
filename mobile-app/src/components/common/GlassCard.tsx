/**
 * GlassCard — glassmorphism (desainuiux.md .glass-bg)
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, spacing, borderRadius } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'pink' | 'white';
  style?: ViewStyle;
  blur?: 'light' | 'medium' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'pink',
  style,
}) => {
  const backgroundColor =
    variant === 'pink' ? colors.effects.glassPink : colors.effects.glassWhite;

  const borderColor =
    variant === 'pink' ? colors.border.glass : colors.effects.glassBlur;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderColor },
        shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
});

export default GlassCard;
