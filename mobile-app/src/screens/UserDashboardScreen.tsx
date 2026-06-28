/**
 * User Dashboard Screen (Caregiver Hub)
 * 3D Glassmorphism Design with Pink Soft Theme + Live IoT Integration
 */

import React from 'react';
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
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../store/authStore';
import { SkeletonLoader, PairingModal } from '../components/common';
import { LiveMeasurementCard } from '../components/common/LiveMeasurementCard';
import { HardwareHealthWidget } from '../components/common/HardwareHealthWidget';
import MBGQuestionnaireModal from '../components/common/MBGQuestionnaireModal';
import HapticService from '../services/HapticService';
import MQTTService from '../services/MQTTService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function UserDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pairingModalVisible, setPairingModalVisible] = React.useState(false);
  const [mbgModalVisible, setMbgModalVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mqttConnected, setMqttConnected] = React.useState(false);
  const [isPaired, setIsPaired] = React.useState(false); // Track pairing status
  const [liveHeight, setLiveHeight] = React.useState(0); // Initial: 0 (no measurement yet)
  const [liveWeight, setLiveWeight] = React.useState(0); // Initial: 0 (no measurement yet)
  const [quality, setQuality] = React.useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [batteryLevel, setBatteryLevel] = React.useState(0);
  const [signalStrength, setSignalStrength] = React.useState(0);

  const mqttService = React.useMemo(() => MQTTService.getInstance(), []);

  // Initialize MQTT Connection
  React.useEffect(() => {
    const initMQTT = async () => {
      try {
        await mqttService.connect();
      } catch (error) {
        console.error('MQTT connection failed:', error);
      }
    };

    initMQTT();

    // Listen to MQTT events
    mqttService.on('connected', () => {
      console.log('✅ Dashboard: MQTT Connected');
      setMqttConnected(true);
      HapticService.success();
    });

    mqttService.on('measurement', (data: any) => {
      // Only accept measurements if device is paired
      if (!isPaired) {
        console.log('⚠️ Dashboard: Measurement ignored (device not paired)');
        return;
      }
      
      console.log('📏 Dashboard: New measurement', data);
      setLiveHeight(data.height_cm);
      setLiveWeight(data.weight_kg || 0);
      setQuality(data.quality);
      setBatteryLevel(data.batteryLevel || 0);
      setSignalStrength(data.signalStrength || 0);
      HapticService.light();
    });

    mqttService.on('offline', () => {
      setMqttConnected(false);
    });

    mqttService.on('error', (error: any) => {
      console.error('MQTT error:', error);
      setMqttConnected(false);
    });

    return () => {
      mqttService.removeAllListeners();
    };
  }, []);

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation handlers
  const handleManualMeasure = async () => {
    await HapticService.buttonPress();
    navigation.navigate('ManualMeasurement');
  };

  const handleViewGrowth = async () => {
    await HapticService.buttonPress();
    navigation.navigate('Grafik');
  };

  const handleViewRecipes = async () => {
    await HapticService.buttonPress();
    navigation.navigate('RecipeList');
  };

  const handleAIChat = async () => {
    await HapticService.buttonPress();
    navigation.navigate('AIAssistant');
  };

  const handleMBGQuestionnaire = async () => {
    await HapticService.buttonPress();
    setMbgModalVisible(true);
  };

  const handleRetryConnect = async () => {
    await HapticService.buttonPress();
    Alert.alert(
      'Reconnect IoT',
      'Mencoba menghubungkan kembali ke perangkat IoT...',
      [{ text: 'OK' }]
    );
    try {
      await mqttService.connect();
    } catch (error) {
      Alert.alert('Error', 'Gagal menghubungkan ke perangkat IoT');
    }
  };

  // Mock child data
  const mockChild = {
    id: 'child_001',
    name: 'Zaki Pratama',
    age: '18 bulan',
    gender: 'Laki-laki',
    lastMeasurement: {
      weight: 10.2,
      height: 78.5,
      date: '21 Des 2025',
    },
    status: 'at_risk',
    statusText: 'Perlu Perhatian',
    zScore: -2.1,
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFB6C1', '#FFF0F5', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Hardware Health Widget - Top Right */}
        <HardwareHealthWidget
          isConnected={mqttConnected}
          batteryLevel={batteryLevel}
          signalStrength={signalStrength}
          onRetryConnect={handleRetryConnect}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <View>
              <Text style={styles.greeting}>Halo, {user?.name || 'Ibu'} 👋</Text>
              <Text style={styles.tagline}>Kawal Tumbuh Kembang Sejak Dini</Text>
            </View>
            <TouchableOpacity style={styles.avatarButton}>
              <Text style={styles.avatar}>{user?.avatar || '👩'}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Live Measurement Card - IoT Data */}
          {mqttConnected && liveHeight > 0 && (
            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
              <LiveMeasurementCard
                height={liveHeight}
                weight={liveWeight}
                quality={quality}
                isConnected={mqttConnected}
              />
            </Animated.View>
          )}

          {/* 3D Child Profile Card */}
          {isLoading ? (
            <View style={{ marginVertical: 16 }}>
              <SkeletonLoader variant="card" count={1} />
            </View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200).duration(600)}>
              <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.cardShadow}>
                <LinearGradient
                  colors={['rgba(255, 105, 180, 0.15)', 'rgba(255, 182, 193, 0.1)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.childHeader}>
                    <View style={styles.childAvatar}>
                      <Text style={styles.childAvatarEmoji}>👶</Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{mockChild.name}</Text>
                      <Text style={styles.childDetails}>
                        {mockChild.gender} • {mockChild.age}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Text style={styles.moreIcon}>⋮</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.measurementRow}>
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Berat</Text>
                      <Text style={styles.measurementValue}>
                        {mockChild.lastMeasurement.weight} kg
                      </Text>
                    </View>
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Tinggi</Text>
                      <Text style={styles.measurementValue}>
                        {mockChild.lastMeasurement.height} cm
                      </Text>
                    </View>
                    <View style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>Z-Score</Text>
                      <Text style={[styles.measurementValue, { color: '#FF9800' }]}>
                        {mockChild.zScore}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusIcon}>⚠️</Text>
                    <Text style={styles.statusText}>{mockChild.statusText}</Text>
                  </View>
                </LinearGradient>
              </View>
            </BlurView>
          </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.actionsContainer}
          >
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
            <View style={styles.actionsGrid}>
              {/* NEW: Ukur Otomatis Button */}
              <Pressable 
                style={[styles.actionCard, styles.actionCardPrimary]} 
                onPress={() => {
                  HapticService.light();
                  setPairingModalVisible(true);
                }}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📡</Text>
                </View>
                <Text style={styles.actionLabel}>Ukur Otomatis</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handleManualMeasure}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>⚖️</Text>
                </View>
                <Text style={styles.actionLabel}>Ukur Manual</Text>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handleViewGrowth}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📊</Text>
                </View>
                <Text style={styles.actionLabel}>Grafik</Text>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handleViewRecipes}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🥘</Text>
                </View>
                <Text style={styles.actionLabel}>Resep MBG</Text>
              </Pressable>

              {/* 🆕 NEW: AI MBG Menu Generator */}
              <Pressable 
                style={[styles.actionCard, styles.actionCardPrimary]} 
                onPress={handleMBGQuestionnaire}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🤖</Text>
                </View>
                <Text style={styles.actionLabel}>AI Menu</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handleAIChat}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>💬</Text>
                </View>
                <Text style={styles.actionLabel}>AI Chat</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Z-Score Widget */}
          <Animated.View entering={FadeInUp.delay(600).duration(600)}>
            <BlurView intensity={15} tint="light" style={styles.zScoreWidget}>
              <Text style={styles.widgetTitle}>Cek Stunting Otomatis</Text>
              <Text style={styles.widgetSubtitle}>
                Berdasarkan standar WHO, anak Anda:
              </Text>
              <View style={styles.zScoreBar}>
                <View style={[styles.zScoreIndicator, { left: '35%' }]} />
                <View style={styles.zScoreLabels}>
                  <Text style={styles.zScoreLabel}>-3</Text>
                  <Text style={styles.zScoreLabel}>-2</Text>
                  <Text style={styles.zScoreLabel}>0</Text>
                  <Text style={styles.zScoreLabel}>+2</Text>
                </View>
              </View>
              <Text style={styles.zScoreResult}>
                Berisiko Stunting - Konsultasi Segera
              </Text>
            </BlurView>
          </Animated.View>
        </ScrollView>

        {/* Pairing Modal */}
        <PairingModal
          visible={pairingModalVisible}
          onClose={() => setPairingModalVisible(false)}
          onSuccess={(deviceInfo) => {
            console.log('Device paired:', deviceInfo);
            setIsPaired(true);
            setBatteryLevel(deviceInfo.batteryLevel || 0);
            setSignalStrength(deviceInfo.signalStrength || 0);
            Alert.alert(
              'Berhasil!', 
              `Terhubung ke ${deviceInfo.name || deviceInfo.deviceId}\n\nSekarang Anda bisa melakukan pengukuran otomatis.`,
              [{ text: 'OK', onPress: () => HapticService.success() }]
            );
          }}
        />

        {/* Hardware Health Widget - Floating */}
        <HardwareHealthWidget
          isConnected={mqttConnected}
          batteryLevel={batteryLevel}
          signalStrength={signalStrength}
          onRetryConnect={handleRetryConnect}
        />

        {/* MBG Questionnaire Modal */}
        <MBGQuestionnaireModal
          visible={mbgModalVisible}
          onClose={() => setMbgModalVisible(false)}
          childAge={18}
          childWeight={mockChild.lastMeasurement.weight}
          childHeight={mockChild.lastMeasurement.height}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF69B4',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
  },
  avatarButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  avatar: {
    fontSize: 28,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarEmoji: {
    fontSize: 32,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 24,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    marginVertical: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 72) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  zScoreWidget: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  zScoreBar: {
    height: 40,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 20,
    marginBottom: 16,
    position: 'relative',
  },
  zScoreIndicator: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 4,
    height: 40,
    backgroundColor: '#FF9800',
    borderRadius: 2,
  },
  zScoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  zScoreLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  zScoreResult: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    textAlign: 'center',
  },
  actionCardPrimary: {
    borderWidth: 3,
    borderColor: '#FF69B4',
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
