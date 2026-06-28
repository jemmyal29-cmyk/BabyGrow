/**
 * Home Screen - KAI-INSPIRED PREMIUM DESIGN
 * Features:
 * - Vibrant Pink Gradient Header
 * - Overlapping Cards (Floating Effect)
 * - 4-Column Icon Grid
 * - Soft Pink Shadows
 * - 24px Border Radius
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Children: undefined;
  Growth: undefined;
  Profile: undefined;
  AIAssistant: undefined;
  IoTDevice: undefined;
  Immunization: undefined;
  Guide: undefined;
};

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF85A1" />
      
      {/* Vibrant Pink Gradient Header - Desain Original! */}
      <LinearGradient
        colors={['#FF85A1', '#FF6B95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Selamat Datang! 👋</Text>
              <Text style={styles.subGreeting}>Monitor pertumbuhan si kecil</Text>
            </View>
            <TouchableOpacity style={styles.notifButton}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overlapping Summary Card (KAI-Style Floating Effect) */}
        <View style={styles.overlappingCard}>
          <Text style={styles.cardTitle}>📊 Ringkasan Anak Anda</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Anak</Text>
              <Text style={styles.statLabel}>Terdaftar</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statusIcon}>
                <Text style={styles.statusEmoji}>✓</Text>
              </View>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statLabel}>Sehat</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statLabel}>Pengukuran</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Fitur Utama</Text>

        {/* 4-Column Icon Grid (KAI-Style) */}
        <View style={styles.iconGrid}>
          <IconGridItem
            icon="👶"
            label="Profil Anak"
            onPress={() => navigation.navigate('Children')}
            color="#FCE4EC"
          />
          <IconGridItem
            icon="📊"
            label="Grafik"
            onPress={() => navigation.navigate('Growth')}
            color="#F8BBD0"
          />
          <IconGridItem
            icon="🤖"
            label="BabyGrow AI"
            onPress={() => navigation.getParent()?.navigate('AIAssistant')}
            color="#F48FB1"
          />
          <IconGridItem
            icon="📏"
            label="IoT Ukur"
            onPress={() => navigation.getParent()?.navigate('IoTDevice')}
            color="#FCE4EC"
          />
        </View>

        <View style={styles.iconGrid}>
          <IconGridItem
            icon="💉"
            label="Imunisasi"
            onPress={() => navigation.getParent()?.navigate('Immunization')}
            color="#F8BBD0"
          />
          <IconGridItem
            icon="🍽️"
            label="Program MBG"
            onPress={() => {}}
            color="#F48FB1"
          />
          <IconGridItem
            icon="📖"
            label="Panduan"
            onPress={() => navigation.getParent()?.navigate('Guide')}
            color="#FCE4EC"
          />
          <IconGridItem
            icon="👤"
            label="Profil"
            onPress={() => navigation.navigate('Profile')}
            color="#F8BBD0"
          />
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>⚠️ Perlu Perhatian</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>1</Text>
            </View>
          </View>
          <Text style={styles.statusText}>
            Zaki (18 bulan) memerlukan pengukuran ulang. Terakhir diukur 14 hari yang lalu.
          </Text>
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => navigation.navigate('Children')}
          >
            <Text style={styles.statusButtonText}>Lihat Detail →</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips Hari Ini</Text>
            <Text style={styles.tipsText}>
              Pastikan anak mendapat asupan protein 15-20g per hari untuk pertumbuhan optimal
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Icon Grid Item Component
function IconGridItem({ icon, label, onPress, color }: { 
  icon: string; 
  label: string; 
  onPress: () => void; 
  color: string;
}) {
  return (
    <TouchableOpacity 
      style={styles.iconGridItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
  },
  header: {
    paddingBottom: 60, // Extra space for overlapping card
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  subGreeting: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    opacity: 0.9,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  // KAI-Style Overlapping Card with Negative Margin
  overlappingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: -40, // NEGATIVE MARGIN for floating effect
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statusEmoji: {
    fontSize: 20,
    color: colors.success,
    fontWeight: typography.fontWeight.bold as any,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  // 4-Column Icon Grid (KAI-Style)
  iconGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  iconGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full, // Perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.soft,
  },
  iconEmoji: {
    fontSize: 28,
  },
  iconLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.white,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  statusButton: {
    alignSelf: 'flex-start',
  },
  statusButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.primary.main,
  },
  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    flexDirection: 'row',
    ...shadows.soft,
  },
  tipsIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});
