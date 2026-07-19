/**
 * BabyGrow Button — Atomic Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === 'outline' || variant === 'text' || variant === 'secondary'
      ? colors.primary.main
      : colors.neutral.white;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[
              styles.label,
              styles[`${variant}Text` as const],
              styles[`${size}Text` as const],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },

  primary: {
    backgroundColor: colors.primary.main,
    ...shadows.pink,
  },
  secondary: {
    backgroundColor: colors.secondary.pureWhite,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  text: {
    backgroundColor: 'transparent',
  },
  label: {
    textAlign: 'center',
  },

  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  primaryText: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  secondaryText: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
  outlineText: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
  textText: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },

  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },

  disabled: {
    backgroundColor: colors.neutral.gray200,
    borderColor: colors.neutral.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: colors.text.disabled,
  },

  fullWidth: {
    width: '100%',
  },
});

export default Button;
