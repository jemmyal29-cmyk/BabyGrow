/**
 * HomeScreen Premium - VIBRANT PINK & ELEGANT WHITE
 * Dashboard dengan Carousel Cards elegant & Professional Health-Tech Design
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme';
import { UnderConstructionModal } from '../components/common';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64;
const CARD_SPACING = 16;

export const HomeScreenPremium = ({ navigation }: any) => {
  const [showModal, setShowModal] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Dummy data - Replace with real data dari API
  const childrenData = [
    {
      id: '1',
      name: 'Zaki Pratama',
      age: '18 bulan',
      weight: '10.2 kg',
      height: '78.5 cm',
      status: 'at_risk',
      statusText: 'Perlu Perhatian',
      lastMeasured: '2 hari lalu',
      photo: '👶',
    },
    {
      id: '2',
      name: 'Aisha Zahra',
      age: '24 bulan',
      weight: '12.5 kg',
      height: '85.0 cm',
      status: 'normal',
      statusText: 'Sehat',
      lastMeasured: '1 minggu lalu',
      photo: '👧',
    },
  ];

  const quickActions = [
    { id: '1', icon: '📊', title: 'Ukur Manual', route: 'IoTDevice' },
    { id: '2', icon: '📡', title: 'Ukur IoT', route: 'IoTDevice' },
    { id: '3', icon: '📈', title: 'Grafik', route: 'Growth' },
    { id: '4', icon: '🤖', title: 'AI Asisten', route: 'AIAssistant' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return colors.stunting.normal;
      case 'at_risk':
        return colors.stunting.atRisk;
      case 'stunted':
        return colors.stunting.stunted;
      default:
        return colors.neutral.gray400;
    }
  };

  const handleFeaturePress = (route: string) => {
    // Cek jika fitur masih dalam perbaikan
    const underConstruction = ['Profile', 'Settings'];
    if (underConstruction.includes(route)) {
      setShowModal(true);
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF85A1" />

      {/* Header dengan Vibrant Pink Gradient - KAI INSPIRED */}
      <LinearGradient
        colors={['#FF1976', '#FF85A1', '#FFB3D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Halo, Bunda! 👋</Text>
              <Text style={styles.subGreeting}>
                Pantau pertumbuhan buah hati dengan cinta
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleFeaturePress('Profile')}
              style={styles.profileButton}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Cards - FLOATING ABOVE HEADER dengan Negative Margin */}
        <View style={styles.carouselSection}>
          <Text style={styles.sectionTitle}>Data Anak</Text>
          
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            contentContainerStyle={styles.carouselContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          >
            {childrenData.map((child, index) => (
              <TouchableOpacity
                key={child.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Children')}
                style={[
                  styles.childCard,
                  index === 0 && { marginLeft: spacing.lg },
                ]}
              >
                {/* Glass Effect Background */}
                <View style={styles.glassCard}>
                  {/* Child Info */}
                  <View style={styles.childHeader}>
                    <View style={styles.childPhoto}>
                      <Text style={styles.childPhotoIcon}>{child.photo}</Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childAge}>{child.age}</Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(child.status) + '20' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(child.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(child.status) },
                        ]}
                      >
                        {child.statusText}
                      </Text>
                    </View>
                  </View>

                  {/* Measurements */}
                  <View style={styles.measurements}>
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Berat</Text>
                      <Text style={styles.measurementValue}>{child.weight}</Text>
                    </View>
                    <View style={styles.measurementDivider} />
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Tinggi</Text>
                      <Text style={styles.measurementValue}>{child.height}</Text>
                    </View>
                  </View>

                  {/* Last Measured */}
                  <Text style={styles.lastMeasured}>
                    Terakhir diukur: {child.lastMeasured}
                  </Text>

                  {/* View Details Button */}
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('Children')}
                  >
                    <LinearGradient
                      colors={['#FF85A1', '#FF6B95']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.detailsButtonGradient}
                    >
                      <Text style={styles.detailsButtonText}>
                        Lihat Detail →
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add New Child Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ChildData')}
              style={[styles.childCard, styles.addChildCard]}
            >
              <View style={styles.glassCard}>
                <View style={styles.addChildContent}>
                  <View style={styles.addChildIcon}>
                    <Text style={styles.addChildIconText}>+</Text>
                  </View>
                  <Text style={styles.addChildTitle}>Tambah Anak</Text>
                  <Text style={styles.addChildSubtitle}>
                    Daftarkan buah hati baru
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {[...childrenData, {}].map((_, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + CARD_SPACING),
                index * (CARD_WIDTH + CARD_SPACING),
                (index + 1) * (CARD_WIDTH + CARD_SPACING),
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { width: dotWidth, opacity },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                onPress={() => handleFeaturePress(action.route)}
                style={styles.quickActionCard}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips Hari Ini 💡</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <LinearGradient
                colors={['#FF85A1', '#FF6B95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipIconGradient}
              >
                <Text style={styles.tipIcon}>🍎</Text>
              </LinearGradient>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                Nutrisi Seimbang untuk Pertumbuhan Optimal
              </Text>
              <Text style={styles.tipDescription}>
                Berikan makanan tinggi protein seperti telur, ikan, dan kacang-kacangan
                untuk mendukung pertumbuhan anak.
              </Text>
            </View>
          </View>
        </View>
        
        {/* BOTTOM SPACER - Agar konten tidak tertutup bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Under Construction Modal */}
      <UnderConstructionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        featureName="fitur ini"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header
  header: {
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileIcon: {
    fontSize: 24,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Carousel Section - FLOATING CARD dengan Negative Margin
  carouselSection: {
    marginTop: -40, // NEGATIVE MARGIN - Card melayang di atas header!
    zIndex: 100, // Layering system
    paddingBottom: spacing.md,
    backgroundColor: 'transparent', // Transparent section, card yang solid
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  carouselContent: {
    paddingRight: spacing.lg,
  },
  
  // Child Card
  childCard: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  glassCard: {
    backgroundColor: '#FFFFFF', // SOLID WHITE - NO TRANSPARENCY!
    borderRadius: 24,
    padding: spacing.lg,
    // SOFT SHADOW yang halus untuk floating effect
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10, // Strong elevation untuk Android
    borderWidth: 2,
    borderColor: '#F5F5F5', // Subtle border
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  childPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#FF85A1',
  },
  childPhotoIcon: {
    fontSize: 32,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  childAge: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  // Status Badge
  statusContainer: {
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  
  // Measurements
  measurements: {
    flexDirection: 'row',
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  measurementItem: {
    flex: 1,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  measurementDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: spacing.md,
  },
  lastMeasured: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  
  // Details Button
  detailsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Add Child Card
  addChildCard: {
    marginRight: 0,
  },
  addChildContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#FF85A1',
    borderStyle: 'dashed',
  },
  addChildIconText: {
    fontSize: 32,
    color: '#FF85A1',
    fontWeight: '300',
  },
  addChildTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  addChildSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF85A1',
    marginHorizontal: 4,
  },
  
  // Quick Actions
  quickActionsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  quickActionCard: {
    width: (width - spacing.lg * 2 - spacing.xs * 6) / 4,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32, // PERFECT CIRCLE - 50% of width/height
    backgroundColor: '#FFFFFF', // SOLID WHITE
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    // Soft shadow untuk depth
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#F8BBD0', // Light pink border
  },
  quickActionIconText: {
    fontSize: 28,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Tips Section
  tipsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // SOLID WHITE
    borderRadius: 20,
    padding: spacing.lg,
    // Strong shadow untuk premium feel
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  tipIconContainer: {
    marginRight: spacing.md,
  },
  tipIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default HomeScreenPremium;
