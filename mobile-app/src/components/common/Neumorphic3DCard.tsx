/**
 * Neumorphic 3D Card Component
 * Komponen kartu dengan efek 3D Neumorphic yang dapat digunakan kembali
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface Neumorphic3DCardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'raised' | 'floating' | 'glass';
  onPress?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Neumorphic3DCard: React.FC<Neumorphic3DCardProps> = ({
  children,
  variant = 'flat',
  onPress,
  style,
  animated = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (animated) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1);
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return styles.flatCard;
      case 'raised':
        return styles.raisedCard;
      case 'floating':
        return styles.floatingCard;
      case 'glass':
        return styles.glassCard;
      default:
        return styles.flatCard;
    }
  };

  const CardWrapper = onPress ? AnimatedPressable : Animated.View;

  if (variant === 'glass') {
    return (
      <CardWrapper
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, getVariantStyle(), style]}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill}>
          <View style={styles.glassInner}>{children}</View>
        </BlurView>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, getVariantStyle(), style]}
    >
      {children}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  flatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#C1C1C1',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  raisedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#C1C1C1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  floatingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#C1C1C1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassInner: {
    padding: 16,
  },
});
