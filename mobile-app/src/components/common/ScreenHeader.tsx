/**
 * ScreenHeader — consistent top app bar (desainuiux.md Identity Anchor)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';
import HapticService from '../../services/HapticService';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Brand-style display title (e.g. BabyGrow) */
  brand?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  brand = false,
  leftAction,
  rightAction,
  onBack,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, spacing.md) }, style]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity
              onPress={async () => {
                await HapticService.buttonPress();
                onBack();
              }}
              hitSlop={12}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          ) : null}
          {leftAction}
          <View style={styles.titleBlock}>
            {brand ? (
              <Text style={styles.brand}>{title || 'BabyGrow'}</Text>
            ) : (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightAction ? <View style={styles.right}>{rightAction}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.default,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  backText: {
    fontSize: 22,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  titleBlock: {
    flex: 1,
  },
  brand: {
    ...typography.styles.displayLg,
    color: colors.primary.main,
  },
  title: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
  },
  subtitle: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
    marginTop: 2,
  },
  right: {
    marginLeft: spacing.md,
  },
});

export default ScreenHeader;
