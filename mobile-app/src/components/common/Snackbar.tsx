/**
 * Quick notification snackbar untuk menggantikan Alert.alert sederhana
 * Design minimal untuk notifikasi cepat tanpa user interaction
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show snackbar
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideSnackbar();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideSnackbar();
    }
  }, [visible, duration]);

  const hideSnackbar = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: colors.status.success, icon: '✅' };
      case 'error':
        return { bg: colors.status.error, icon: '❌' };
      case 'warning':
        return { bg: colors.status.warning, icon: '⚠️' };
      default:
        return { bg: colors.primary.main, icon: '💗' };
    }
  };

  const { bg, icon } = getColors();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.element,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.primaryGlow,
    zIndex: 1000,
  },
  icon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.inverse,
  },
});

export default Snackbar;
