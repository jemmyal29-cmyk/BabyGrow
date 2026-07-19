/**
 * User Dashboard — real data from useChildren + useLatestMeasurement + MQTT sync
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../store/authStore';
import {
  SkeletonLoader,
  PairingModal,
  ScreenHeader,
  SyncStatusIndicator,
} from '../components/common';
import { LiveMeasurementCard } from '../components/common/LiveMeasurementCard';
import { HardwareHealthWidget } from '../components/common/HardwareHealthWidget';
import MBGQuestionnaireModal from '../components/common/MBGQuestionnaireModal';
import HapticService from '../services/HapticService';
import MQTTService from '../services/MQTTService';
import MeasurementSyncService from '../services/MeasurementSyncService';
import type { MQTTMeasurement } from '../types';
import { ageLabelFromDob, useChildren } from '../hooks/useChildren';
import {
  getStuntingDisplay,
  useLatestMeasurement,
} from '../hooks/useMeasurements';
import { calculateAgeInMonths } from '../utils/zScoreCalculator';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useChildStore } from '../store/childStore';

const { width } = Dimensions.get('window');
const BG_GRADIENT = colors.secondary.gradient.softBg;

function formatMeasuredAt(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Map z-score (-3…+3) → bar position 0–100% */
function zScoreBarPercent(z: number | null | undefined): number {
  if (z == null || Number.isNaN(z)) return 50;
  const clamped = Math.max(-3, Math.min(3, z));
  return ((clamped + 3) / 6) * 100;
}

export default function UserDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const {
    data: children = [],
    isPending: childrenLoading,
    isError: childrenError,
  } = useChildren({ parentId: user?.id });

  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const activeChildId = useChildStore((s) => s.activeChildId);
  const activeChild = useChildStore((s) => s.activeChild);

  const {
    data: latest,
    isPending: latestLoading,
  } = useLatestMeasurement(activeChildId);

  const [pairingModalVisible, setPairingModalVisible] = React.useState(false);
  const [mbgModalVisible, setMbgModalVisible] = React.useState(false);
  const [mqttConnected, setMqttConnected] = React.useState(false);
  const [isPaired, setIsPaired] = React.useState(false);
  const isPairedRef = React.useRef(false);
  const [batteryLevel, setBatteryLevel] = React.useState(0);
  const [signalStrength, setSignalStrength] = React.useState(0);

  const mqttService = React.useMemo(() => MQTTService.getInstance(), []);
  const syncService = React.useMemo(
    () => MeasurementSyncService.getInstance(),
    []
  );

  // Keep Zustand activeChild in sync with children list (race-safe)
  React.useEffect(() => {
    if (children.length === 0) {
      if (activeChildId) setActiveChild(null);
      return;
    }
    const preferred = activeChildId
      ? children.find((c) => c.id === activeChildId)
      : undefined;
    const next = preferred ?? children[0];
    if (
      activeChild?.id === next.id &&
      activeChild.gender === next.gender &&
      activeChild.date_of_birth === next.date_of_birth &&
      activeChild.name === next.name
    ) {
      return;
    }
    setActiveChild({
      id: next.id,
      name: next.name,
      gender: next.gender,
      date_of_birth: next.date_of_birth,
    });
  }, [children, activeChildId, activeChild, setActiveChild]);

  React.useEffect(() => {
    isPairedRef.current = isPaired;
  }, [isPaired]);

  React.useEffect(() => {
    const onConnected = () => {
      setMqttConnected(true);
      HapticService.success();
    };
    const onOffline = () => setMqttConnected(false);
    const onMeasurement = (raw: unknown) => {
      if (!isPairedRef.current) return;
      const data = raw as MQTTMeasurement;
      setBatteryLevel(data.batteryLevel || 0);
      setSignalStrength(data.signalStrength || 0);
      HapticService.light();
    };

    mqttService.on('connected', onConnected);
    mqttService.on('offline', onOffline);
    mqttService.on('disconnected', onOffline);
    mqttService.on('measurement', onMeasurement);

    (async () => {
      try {
        await mqttService.connect();
      } catch (error) {
        console.warn('MQTT broker unreachable — simulated mode', error);
        mqttService.markSimulatedConnected();
      }
    })();

    syncService.start();

    return () => {
      mqttService.off('connected', onConnected);
      mqttService.off('offline', onOffline);
      mqttService.off('disconnected', onOffline);
      mqttService.off('measurement', onMeasurement);
      syncService.stop();
    };
  }, [mqttService, syncService]);

  const stunting = React.useMemo(
    () =>
      getStuntingDisplay({
        stunting_risk: latest?.stunting_risk,
        z_score_hfa: latest?.z_score_hfa,
        z_score_wfa: latest?.z_score_wfa,
      }),
    [latest]
  );

  const ageMonths = activeChild
    ? calculateAgeInMonths(activeChild.date_of_birth)
    : 18;

  const handleSelectChild = async () => {
    await HapticService.buttonPress();
    navigation.navigate('Children');
  };

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
    try {
      await mqttService.connect();
    } catch {
      Alert.alert('Error', 'Gagal menghubungkan ke perangkat IoT');
    }
  };

  const profileLoading = childrenLoading || (!!activeChildId && latestLoading);

  return (
    <View style={styles.container}>
      <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <ScreenHeader
              brand
              title="BabyGrow"
              subtitle={`Halo, ${user?.name || 'Ibu'}`}
              rightAction={<SyncStatusIndicator />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(80).duration(500)}>
            <LiveMeasurementCard
              childId={activeChildId}
              bindMqtt
              isConnected={mqttConnected}
              onSelectChild={handleSelectChild}
            />
          </Animated.View>

          {childrenError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Gagal memuat data anak</Text>
            </View>
          ) : null}

          {!childrenLoading && children.length === 0 ? (
            <Pressable style={styles.emptyChild} onPress={handleSelectChild}>
              <Text style={styles.emptyChildTitle}>Belum ada anak</Text>
              <Text style={styles.emptyChildHint}>
                Tambahkan profil anak untuk mulai monitoring pertumbuhan.
              </Text>
            </Pressable>
          ) : profileLoading ? (
            <View style={{ marginVertical: spacing.sm }}>
              <SkeletonLoader variant="card" count={1} style={{ padding: 0 }} />
            </View>
          ) : activeChild ? (
            <Animated.View entering={FadeInUp.delay(160).duration(500)}>
              <BlurView intensity={20} tint="light" style={styles.glassCard}>
                <View style={styles.cardShadow}>
                  <LinearGradient
                    colors={[
                      'rgba(182, 0, 89, 0.12)',
                      'rgba(255, 217, 225, 0.35)',
                    ]}
                    style={styles.cardGradient}
                  >
                    <View style={styles.childHeader}>
                      <View style={styles.childAvatar}>
                        <Text style={styles.childAvatarEmoji}>
                          {activeChild.gender === 'female' ? '👧' : '👦'}
                        </Text>
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{activeChild.name}</Text>
                        <Text style={styles.childDetails}>
                          {activeChild.gender === 'female'
                            ? 'Perempuan'
                            : 'Laki-laki'}{' '}
                          · {ageLabelFromDob(activeChild.date_of_birth)}
                        </Text>
                        {latest?.measured_at ? (
                          <Text style={styles.measuredHint}>
                            Terakhir diukur {formatMeasuredAt(latest.measured_at)}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        style={styles.moreButton}
                        onPress={handleSelectChild}
                        hitSlop={8}
                      >
                        <Text style={styles.moreIcon}>⇄</Text>
                      </Pressable>
                    </View>

                    <View style={styles.divider} />

                    {!latest ? (
                      <Text style={styles.noMeasure}>Belum ada pengukuran</Text>
                    ) : (
                      <View style={styles.measurementRow}>
                        <View style={styles.measurementItem}>
                          <Text style={styles.measurementLabel}>Berat</Text>
                          <Text style={styles.measurementValue}>
                            {latest.weight_kg != null
                              ? `${Number(latest.weight_kg).toFixed(1)} kg`
                              : '—'}
                          </Text>
                        </View>
                        <View style={styles.measurementItem}>
                          <Text style={styles.measurementLabel}>Tinggi</Text>
                          <Text style={styles.measurementValue}>
                            {Number(latest.height_cm).toFixed(1)} cm
                          </Text>
                        </View>
                        <View style={styles.measurementItem}>
                          <Text style={styles.measurementLabel}>Z-Score</Text>
                          <Text
                            style={[
                              styles.measurementValue,
                              {
                                color:
                                  stunting?.color ?? colors.text.onSurface,
                              },
                            ]}
                          >
                            {latest.z_score_hfa != null
                              ? Number(latest.z_score_hfa).toFixed(2)
                              : '—'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {stunting ? (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${stunting.color}18` },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: stunting.color },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: stunting.color }]}
                        >
                          {stunting.label}
                        </Text>
                      </View>
                    ) : latest ? null : null}
                  </LinearGradient>
                </View>
              </BlurView>
            </Animated.View>
          ) : null}

          <Animated.View
            entering={FadeInUp.delay(280).duration(500)}
            style={styles.actionsContainer}
          >
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={[styles.actionCard, styles.actionCardPrimary]}
                onPress={async () => {
                  await HapticService.light();
                  setPairingModalVisible(true);
                }}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📡</Text>
                </View>
                <Text style={styles.actionLabel}>Ukur Otomatis</Text>
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

              <Pressable
                style={[styles.actionCard, styles.actionCardPrimary]}
                onPress={handleMBGQuestionnaire}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🤖</Text>
                </View>
                <Text style={styles.actionLabel}>AI Menu</Text>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handleAIChat}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>💬</Text>
                </View>
                <Text style={styles.actionLabel}>AI Chat</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <BlurView intensity={15} tint="light" style={styles.zScoreWidget}>
              <Text style={styles.widgetTitle}>Cek Stunting Otomatis</Text>
              <Text style={styles.widgetSubtitle}>
                Berdasarkan standar WHO (TB/U):
              </Text>
              {!latest || latest.z_score_hfa == null ? (
                <Text style={styles.zScoreResultMuted}>
                  Belum ada pengukuran
                </Text>
              ) : (
                <>
                  <View style={styles.zScoreBar}>
                    <View
                      style={[
                        styles.zScoreIndicator,
                        {
                          left: `${zScoreBarPercent(latest.z_score_hfa)}%`,
                          backgroundColor:
                            stunting?.color ?? colors.status.warning,
                        },
                      ]}
                    />
                    <View style={styles.zScoreLabels}>
                      <Text style={styles.zScoreLabel}>-3</Text>
                      <Text style={styles.zScoreLabel}>-2</Text>
                      <Text style={styles.zScoreLabel}>0</Text>
                      <Text style={styles.zScoreLabel}>+2</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.zScoreResult,
                      { color: stunting?.color ?? colors.text.onSurface },
                    ]}
                  >
                    {stunting
                      ? `${stunting.label} (z = ${Number(latest.z_score_hfa).toFixed(2)})`
                      : `Z-Score ${Number(latest.z_score_hfa).toFixed(2)}`}
                  </Text>
                </>
              )}
            </BlurView>
          </Animated.View>
        </ScrollView>

        <PairingModal
          visible={pairingModalVisible}
          onClose={() => setPairingModalVisible(false)}
          onSuccess={(deviceInfo) => {
            setIsPaired(true);
            setBatteryLevel(deviceInfo.batteryLevel || 0);
            setSignalStrength(deviceInfo.signalStrength || 0);
            Alert.alert(
              'Berhasil!',
              `Terhubung ke ${deviceInfo.name || deviceInfo.deviceId}`,
              [{ text: 'OK', onPress: () => HapticService.success() }]
            );
          }}
        />

        <HardwareHealthWidget
          isConnected={mqttConnected}
          batteryLevel={batteryLevel}
          signalStrength={signalStrength}
          onRetryConnect={handleRetryConnect}
        />

        <MBGQuestionnaireModal
          visible={mbgModalVisible}
          onClose={() => setMbgModalVisible(false)}
          childAge={ageMonths}
          childWeight={
            latest?.weight_kg != null ? Number(latest.weight_kg) : undefined
          }
          childHeight={
            latest?.height_cm != null ? Number(latest.height_cm) : undefined
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  errorBox: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.status.errorContainer,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.status.error,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyChild: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyChildTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: 18,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  emptyChildHint: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  glassCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  cardShadow: {
    ...{
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  cardGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  childAvatarEmoji: {
    fontSize: 32,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  measuredHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  moreButton: {
    padding: spacing.sm,
  },
  moreIcon: {
    fontSize: 20,
    color: colors.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.divider,
    marginVertical: spacing.md,
  },
  noMeasure: {
    textAlign: 'center',
    color: colors.text.secondary,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - spacing.containerPadding * 2 - spacing.md) / 2,
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardPrimary: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.fixed,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.fixed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.onSurface,
    textAlign: 'center',
  },
  zScoreWidget: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  zScoreBar: {
    height: 40,
    backgroundColor: colors.effects.glassPink,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  zScoreIndicator: {
    position: 'absolute',
    top: 0,
    marginLeft: -2,
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  zScoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 10,
  },
  zScoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  zScoreResult: {
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  zScoreResultMuted: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
