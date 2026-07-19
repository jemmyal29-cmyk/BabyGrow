/**
 * Button — Atomic (desainuiux.md)
 * Primary = pill + primaryGlow; haptic on every primary action
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
import HapticService from '../../services/HapticService';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  haptic = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (isDisabled) return;
    if (haptic) {
      await HapticService.buttonPress();
    }
    onPress();
  };

  const spinnerColor =
    variant === 'primary' ? colors.primary.onPrimary : colors.primary.main;

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
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.92}
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
    borderRadius: borderRadius.full,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.styles.buttonText,
    textAlign: 'center',
  },

  primary: {
    backgroundColor: colors.primary.main,
    ...shadows.primaryGlow,
  },
  secondary: {
    backgroundColor: colors.surface.lowest,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.outline.default,
  },
  text: {
    backgroundColor: 'transparent',
  },

  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  medium: {
    paddingVertical: spacing.element,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },

  primaryText: {
    color: colors.primary.onPrimary,
  },
  secondaryText: {
    color: colors.primary.main,
  },
  outlineText: {
    color: colors.text.onSurface,
  },
  textText: {
    color: colors.primary.main,
  },

  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.md,
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
