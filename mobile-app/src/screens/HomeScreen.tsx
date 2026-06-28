import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, Ibu Sari! 👋</Text>
            <Text style={styles.subGreeting}>Selamat datang di BabyGrow</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Fitur Utama</Text>
        <View style={styles.menuGrid}>
          {/* Beranda */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardPrimary]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuIcon}>🏠</Text>
            <Text style={styles.menuTitle}>Beranda</Text>
            <Text style={styles.menuDesc}>Dashboard utama</Text>
          </TouchableOpacity>

          {/* Riwayat */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardSecondary]}
            onPress={() => navigation.navigate('Children')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuIcon}>📜</Text>
            <Text style={styles.menuTitle}>Riwayat</Text>
            <Text style={styles.menuDesc}>Data pengukuran</Text>
          </TouchableOpacity>

          {/* BabyGrow AI */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardAI]}
            onPress={() => navigation.getParent()?.navigate('AIAssistant')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuIcon}>🤖</Text>
            <Text style={styles.menuTitle}>BabyGrow AI</Text>
            <Text style={styles.menuDesc}>Solusi Cegah Stunting</Text>
          </TouchableOpacity>

          {/* Imunisasi */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardImun]}
            onPress={() => navigation.getParent()?.navigate('Immunization')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuIcon}>💉</Text>
            <Text style={styles.menuTitle}>Imunisasi</Text>
            <Text style={styles.menuDesc}>Jadwal vaksin</Text>
          </TouchableOpacity>

          {/* Akun */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardAkun]}
            onPress={() => navigation.getParent()?.navigate('Profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuTitle}>Akun</Text>
            <Text style={styles.menuDesc}>Profil & pengaturan</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips Hari Ini</Text>
          <Text style={styles.tipsText}>
            Berikan ASI eksklusif selama 6 bulan pertama untuk pertumbuhan optimal bayi Anda.
          </Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid white background
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding untuk bottom tabs (70-85px + buffer)
    backgroundColor: '#FFFFFF', // Solid white background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
  },
  subGreeting: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: spacing.md,
  },
  menuCard: {
    width: (width - 44) / 2,
    aspectRatio: 1.1,
    margin: 8,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Pure white fallback
    borderWidth: 3,
    borderColor: colors.neutral.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 10,
    padding: 16,
  },
  menuCardPrimary: {
    backgroundColor: '#FF69B4', // Solid pink - Beranda
    borderColor: '#FF1493',
    borderWidth: 3,
  },
  menuCardSecondary: {
    backgroundColor: '#E3F2FD', // Solid light blue - Riwayat
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  menuCardAI: {
    backgroundColor: '#90CAF9', // Solid strong blue - AI
    borderColor: '#1976D2',
    borderWidth: 3,
  },
  menuCardImun: {
    backgroundColor: '#A5D6A7', // Solid strong green - Imunisasi
    borderColor: '#388E3C',
    borderWidth: 3,
  },
  menuCardAkun: {
    backgroundColor: '#FFCC80', // Solid strong orange - Akun
    borderColor: '#F57C00',
    borderWidth: 3,
  },
  menuIcon: {
    fontSize: 38,
    marginBottom: 10,
    color: colors.primary.contrast,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  menuTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray900,
    marginBottom: 2,
    textAlign: 'center',
  },
  menuDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    textAlign: 'center',
    opacity: 1,
  },
  // subGreeting style already defined above
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notifIcon: {
    fontSize: typography.fontSize.lg,
  },
  statsCard: {
    backgroundColor: colors.primary.main,
    margin: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.white,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.white,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  tipsCard: {
    backgroundColor: '#FFFDE7',
    margin: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },

});

export default HomeScreen;
