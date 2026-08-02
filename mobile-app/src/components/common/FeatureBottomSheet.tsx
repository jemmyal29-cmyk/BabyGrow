/**
 * Bottom Sheet Component
 * Lembaran dari bawah untuk fitur under development
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {colors, typography, spacing, borderRadius, shadows} from '../../theme';

interface FeatureBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  featureIcon: string;
  description: string;
}

const { height } = Dimensions.get('window');

export const FeatureBottomSheet: React.FC<FeatureBottomSheetProps> = ({
  visible,
  onClose,
  featureName,
  featureIcon,
  description,
}) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <LinearGradient
            colors={[colors.surface.lowest, colors.primary.fixed]}
            style={styles.sheetContent}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Icon dengan 3D Effect */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{featureIcon}</Text>
                <View style={styles.iconGlow} />
              </View>

              <Text style={styles.title}>{featureName}</Text>
              <Text style={styles.description}>{description}</Text>

              {/* AI Animation Indicator */}
              <View style={styles.aiIndicator}>
                <View style={styles.aiDot} />
                <View style={styles.aiDot} />
                <View style={styles.aiDot} />
              </View>

              <Text style={styles.statusText}>
                🤖 AI sedang menyiapkan data...
              </Text>

              {/* Close Button */}
              <Pressable style={styles.closeButton} onPress={onClose}>
                <LinearGradient
                  colors={[...colors.secondary.gradient.vibrantPink]}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Mengerti</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.effects.shadowMedium,
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.large,
  },
  sheetContent: {
    paddingBottom: spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: colors.neutral.gray300,
    borderRadius: borderRadius.DEFAULT,
    alignSelf: 'center',
    marginTop: spacing.element,
    marginBottom: spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.primaryGlow,
  },
  icon: {
    fontSize: typography.fontSize.huge,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    opacity: 0.2,
    transform: [{ scale: 1.2 }],
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.primary,
    marginBottom: spacing.element,
    textAlign: 'center',
  },
  description: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  aiIndicator: {
    flexDirection: 'row',
    gap: spacing.element,
    marginBottom: spacing.md,
  },
  aiDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray400,
    marginBottom: spacing.xl,
  },
  closeButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.primaryGlow,
  },
  closeButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.lg,
    color: colors.text.inverse,
  },
});
