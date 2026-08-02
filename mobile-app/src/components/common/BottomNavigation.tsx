/**
 * Fixed Bottom Navigation - KAI-INSPIRED PREMIUM
 * Features:
 * - Fixed position at bottom
 * - 5 tabs with circular active indicator
 * - Minimalist icons
 * - Soft pink active state
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type TabItem = {
  key: string;
  icon: string;
  label: string;
};

const TABS: TabItem[] = [
  { key: 'Home', icon: '🏠', label: 'Beranda' },
  { key: 'Growth', icon: '📊', label: 'Riwayat' },
  { key: 'AIAssistant', icon: '🤖', label: 'BabyGrow AI' },
  { key: 'Profile', icon: '👤', label: 'Akun' },
];

type BottomNavProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export default function BottomNavigation({ state, descriptors, navigation }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom || spacing.sm }
    ]}>
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.key);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: state.routes[index].key,
            });
          };

          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[state.routes[index].key]?.options?.tabBarAccessibilityLabel}
              testID={descriptors[state.routes[index].key]?.options?.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {/* KAI-Style Circular Active Indicator */}
              {isFocused && <View style={styles.activeIndicator} />}
              
              {/* Icon with pink background when active */}
              <View style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive
              ]}>
                <Text style={styles.icon}>{tab.icon}</Text>
              </View>

              {/* Label */}
              <Text style={[
                styles.label,
                isFocused && styles.labelActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: colors.outline.variant,
    ...shadows.diffusion,
    shadowOffset: { width: 0, height: -8 },
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: spacing.xl,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
  },
  iconContainer: {
    width: spacing.section,
    height: spacing.section,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconContainerActive: {
    backgroundColor: colors.background.overlay,
  },
  icon: {
    fontSize: typography.fontSize.xl,
  },
  label: {
    ...typography.styles.labelCaps,
    fontSize: typography.fontSize.xs,
    letterSpacing: 0,
    textTransform: 'none',
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
});