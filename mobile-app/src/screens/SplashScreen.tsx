/**
 * BabyGrow — Splash (desainuiux.md: Premium Infant Monitoring)
 * White canvas, soft primary glow, wordmark + pill loader
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pillProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const pillLoop = Animated.loop(
      Animated.timing(pillProgress, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    pillLoop.start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2600);

    return () => {
      clearTimeout(timer);
      pulse.stop();
      pillLoop.stop();
    };
  }, [fadeAnim, pulseAnim, pillProgress, onFinish]);

  const pill1Width = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [32, 4, 4, 32],
  });
  const pill2Width = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [4, 32, 4, 4],
  });
  const pill3Width = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [4, 4, 32, 4],
  });
  const pill1Opacity = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [1, 0.2, 0.2, 1],
  });
  const pill2Opacity = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.2, 1, 0.2, 0.2],
  });
  const pill3Opacity = pillProgress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.2, 0.2, 1, 0.2],
  });

  return (
    <View style={styles.container}>
      {/* Atmospheric primary glow */}
      <View style={styles.glowOrb} pointerEvents="none" />

      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons
          name="heart-cog"
          size={48}
          color={colors.primary.main}
          style={styles.icon}
        />

        <Text style={styles.wordmark}>BabyGrow</Text>

        <View style={styles.pillRow}>
          <Animated.View
            style={[
              styles.pill,
              { width: pill1Width, opacity: pill1Opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.pill,
              { width: pill2Width, opacity: pill2Opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.pill,
              { width: pill3Width, opacity: pill3Opacity },
            ]}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerLabel}>Secure Monitoring Environment</Text>
        <Text style={styles.credit}>Created by Tio 2026</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primary.main,
    opacity: 0.07,
    // Soft “blur” via oversized translucent disc
    transform: [{ scale: 1.4 }],
  },
  brandBlock: {
    zIndex: 10,
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginBottom: spacing.md,
  },
  wordmark: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.letterSpacing.display,
    color: colors.primary.main,
    textShadowColor: 'rgba(255, 0, 127, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  pillRow: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 4,
  },
  pill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primary.main,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
  },
  footerLabel: {
    ...typography.styles.labelCaps,
    color: 'rgba(94, 94, 94, 0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  credit: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: 'rgba(94, 94, 94, 0.45)',
  },
});

export default SplashScreen;
