/**
 * Admin Dashboard Screen (Medical Command Center)
 * Clean 3D Design with Deep Pink/Navy Theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '../store/authStore';
import { SkeletonLoader } from '../components/common';
import HapticService from '../services/HapticService';

const { width } = Dimensions.get('window');

interface StatCard {
  id: string;
  icon: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

interface ParentData {
  id: string;
  name: string;
  childrenCount: number;
  stuntingCount: number;
  lastVisit: string;
  status: 'active' | 'alert' | 'inactive';
}

export default function AdminDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'parents' | 'mbg'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Navigation Handlers
  const handleParentDetail = async (parentId: string) => {
    await HapticService.buttonPress();
    Alert.alert(
      'Detail Orang Tua',
      `Menampilkan detail data orang tua dengan ID: ${parentId}`,
      [{ text: 'OK' }]
    );
    // TODO: navigation.navigate('ParentDetail', { parentId });
  };

  const handleStatPress = async (statLabel: string) => {
    await HapticService.light();
    Alert.alert('Statistik', `Melihat detail ${statLabel}`);
  };

  // Mock Statistics
  const stats: StatCard[] = [
    {
      id: '1',
      icon: '👶',
      label: 'Total Balita',
      value: 342,
      change: '+12',
      trend: 'up',
      color: '#4CAF50',
    },
    {
      id: '2',
      icon: '⚠️',
      label: 'Stunting',
      value: 47,
      change: '-3',
      trend: 'down',
      color: '#FF9800',
    },
    {
      id: '3',
      icon: '✅',
      label: 'Gizi Baik',
      value: 295,
      change: '+15',
      trend: 'up',
      color: '#2196F3',
    },
    {
      id: '4',
      icon: '🥘',
      label: 'MBG Aktif',
      value: 89,
      change: '+8',
      trend: 'up',
      color: '#9C27B0',
    },
  ];

  // Mock Parents Data
  const parentsData: ParentData[] = [
    {
      id: 'p001',
      name: 'Ibu Sari',
      childrenCount: 2,
      stuntingCount: 1,
      lastVisit: '2 hari lalu',
      status: 'alert',
    },
    {
      id: 'p002',
      name: 'Ibu Dewi',
      childrenCount: 1,
      stuntingCount: 0,
      lastVisit: '1 minggu lalu',
      status: 'active',
    },
    {
      id: 'p003',
      name: 'Ibu Rita',
      childrenCount: 3,
      stuntingCount: 0,
      lastVisit: '3 hari lalu',
      status: 'active',
    },
    {
      id: 'p004',
      name: 'Ibu Maya',
      childrenCount: 1,
      stuntingCount: 1,
      lastVisit: '1 bulan lalu',
      status: 'inactive',
    },
  ];

  const renderStatCard = ({ item, index }: { item: StatCard; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(600)}>
      <Pressable onPress={() => handleStatPress(item.label)}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.statCard}
        >
        <View style={styles.statHeader}>
          <View style={[styles.statIcon, { backgroundColor: `${item.color}20` }]}>
            <Text style={styles.statEmoji}>{item.icon}</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: item.trend === 'up' ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.trendText, { color: item.trend === 'up' ? '#4CAF50' : '#FF9800' }]}>
              {item.change}
            </Text>
          </View>
        </View>
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  const renderParentItem = ({ item }: { item: ParentData }) => (
    <Pressable 
      style={styles.parentCard} 
      android_ripple={{ color: '#E0E0E0' }}
      onPress={() => handleParentDetail(item.id)}
    >
      <View style={styles.parentHeader}>
        <View style={[styles.statusDot, { backgroundColor: 
          item.status === 'alert' ? '#FF9800' : 
          item.status === 'active' ? '#4CAF50' : '#9E9E9E' 
        }]} />
        <Text style={styles.parentName}>{item.name}</Text>
      </View>
      <View style={styles.parentStats}>
        <View style={styles.parentStatItem}>
          <Text style={styles.parentStatLabel}>Anak</Text>
          <Text style={styles.parentStatValue}>{item.childrenCount}</Text>
        </View>
        <View style={styles.parentStatItem}>
          <Text style={styles.parentStatLabel}>Stunting</Text>
          <Text style={[styles.parentStatValue, { color: item.stuntingCount > 0 ? '#FF9800' : '#4CAF50' }]}>
            {item.stuntingCount}
          </Text>
        </View>
        <View style={styles.parentStatItem}>
          <Text style={styles.parentStatLabel}>Kunjungan</Text>
          <Text style={styles.parentStatValueSmall}>{item.lastVisit}</Text>
        </View>
      </View>
      <View style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>Lihat Detail →</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A237E', '#283593', '#3949AB']}
        style={styles.headerGradient}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Command Center</Text>
            <Text style={styles.headerSubtitle}>
              {user?.location?.puskesmas || 'Puskesmas'} • {user?.location?.city || 'Jakarta'}
            </Text>
          </View>
          <TouchableOpacity style={styles.adminAvatar}>
            <Text style={styles.adminAvatarEmoji}>{user?.avatar || '👨‍⚕️'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'parents' && styles.tabActive]}
            onPress={() => setSelectedTab('parents')}
          >
            <Text style={[styles.tabText, selectedTab === 'parents' && styles.tabTextActive]}>
              Data Orang Tua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'mbg' && styles.tabActive]}
            onPress={() => setSelectedTab('mbg')}
          >
            <Text style={[styles.tabText, selectedTab === 'mbg' && styles.tabTextActive]}>
              MBG Monitor
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {selectedTab === 'overview' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Statistik Ringkasan</Text>
            {isLoading ? (
              <View style={styles.statsGrid}>
                <SkeletonLoader variant="stat" count={4} />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <View key={stat.id} style={{ width: (width - 60) / 2 }}>
                    {renderStatCard({ item: stat, index })}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {selectedTab === 'parents' && (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Manajemen Orang Tua</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Tambah</Text>
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View style={{ padding: 16 }}>
                <SkeletonLoader variant="list" count={5} />
              </View>
            ) : (
              <FlashList
                data={parentsData}
                renderItem={renderParentItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {selectedTab === 'mbg' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Monitor MBG (Makan Bergizi Gratis)</Text>
            <View style={styles.mbgCard}>
              <Text style={styles.mbgTitle}>Penyaluran Bulan Ini</Text>
              <Text style={styles.mbgValue}>89 Balita</Text>
              <View style={styles.mbgProgress}>
                <View style={[styles.mbgProgressBar, { width: '75%' }]} />
              </View>
              <Text style={styles.mbgPercentage}>75% dari target</Text>
            </View>

            <View style={styles.mbgCard}>
              <Text style={styles.mbgTitle}>Menu Populer</Text>
              <View style={styles.mbgMenuItem}>
                <Text style={styles.mbgMenuEmoji}>🥘</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mbgMenuName}>Bubur Kacang Hijau + Telur</Text>
                  <Text style={styles.mbgMenuCount}>32 porsi minggu ini</Text>
                </View>
              </View>
              <View style={styles.mbgMenuItem}>
                <Text style={styles.mbgMenuEmoji}>🍲</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mbgMenuName}>Sop Ayam Sayuran</Text>
                  <Text style={styles.mbgMenuCount}>28 porsi minggu ini</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  adminAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  adminAvatarEmoji: {
    fontSize: 28,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    flex: 1,
    padding: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  parentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  parentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  parentStatItem: {
    alignItems: 'center',
  },
  parentStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  parentStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  parentStatValueSmall: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButton: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF69B4',
  },
  mbgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mbgTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  mbgValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF69B4',
    marginBottom: 16,
  },
  mbgProgress: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  mbgProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  mbgPercentage: {
    fontSize: 14,
    color: '#666',
  },
  mbgMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mbgMenuEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  mbgMenuName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mbgMenuCount: {
    fontSize: 12,
    color: '#666',
  },
});
