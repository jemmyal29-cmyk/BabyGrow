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
  { key: 'Immunization', icon: '💉', label: 'Imunisasi' },
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
    backgroundColor: '#FFFFFF', // SOLID WHITE - NO TRANSPARENCY!
    borderTopWidth: 3,
    borderTopColor: '#FF85A1', // Vibrant Pink border - KAI style!
    // STRONG SHADOW untuk layering yang jelas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20, // Android shadow - HIGHEST!
    zIndex: 1000, // ALWAYS ON TOP!
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
  // KAI-Style Circular Active Indicator
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 32,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs / 2,
  },
  iconContainerActive: {
    backgroundColor: colors.primary.main + '15', // 15% opacity pink background
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold as any,
  },
});
