/**
 * GlassCard Component
 * Glassmorphism card dengan efek transparan & blur
 * Filosofi: VIBRANT PINK & ELEGANT WHITE
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows } from '../../theme';

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
  blur = 'medium',
}) => {
  const backgroundColor = variant === 'pink' 
    ? colors.effects.glassPink 
    : colors.effects.glassWhite;

  const borderColor = variant === 'pink'
    ? 'rgba(255, 133, 161, 0.3)'
    : 'rgba(255, 255, 255, 0.5)';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    // Note: Real blur effect requires react-native-blur library
    // For now, we use transparency to simulate glass effect
  },
});

export default GlassCard;
