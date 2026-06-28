/**
 * NeumorphicButton Component
 * Button dengan efek neumorphic (3D subtle depth)
 * Filosofi: VIBRANT PINK & ELEGANT WHITE
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { colors, typography, shadows } from '@theme';

interface NeumorphicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = variant === 'primary'
    ? colors.primary.vibrant
    : colors.secondary.pureWhite;

  const textColor = variant === 'primary'
    ? colors.text.white
    : colors.primary.vibrant;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: disabled ? colors.neutral.gray300 : backgroundColor,
          },
          variant === 'primary' ? shadows.pink : shadows.standard,
          // Neumorphic dual shadows
          {
            shadowColor: variant === 'primary' ? '#FF6B95' : '#000',
          },
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.text,
            {
              color: disabled ? colors.text.disabled : textColor,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default NeumorphicButton;
