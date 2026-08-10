/**
 * User Dashboard — Parent Beranda (Officer Dashboard layout, desainuiux.md)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/authStore';
import {
  SkeletonLoader,
  PairingModal,
  SyncStatusIndicator,
} from '../components/common';
import {
  WelcomeHeader,
  HeroStatusBanner,
  QuickMenuTile,
  SectionHeading,
  RiskPill,
} from '../components/common/DashboardUI';
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
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useChildStore } from '../store/childStore';
import { useSyncStatus } from '../hooks/useSyncStatus';

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

function zScoreBarPercent(z: number | null | undefined): number {
  if (z == null || Number.isNaN(z)) return 50;
  const clamped = Math.max(-3, Math.min(3, z));
  return ((clamped + 3) / 6) * 100;
}

export default function UserDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const cardW = Math.max(
    140,
    (width - spacing.containerPadding * 2 - spacing.stackGap) / 2
  );

  const {
    data: children = [],
    isPending: childrenLoading,
    isError: childrenError,
  } = useChildren({ parentId: user?.id });

  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const activeChildId = useChildStore((s) => s.activeChildId);
  const activeChild = useChildStore((s) => s.activeChild);

  const { data: latest, isPending: latestLoading } =
    useLatestMeasurement(activeChildId);

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
  const syncStatus = useSyncStatus();
  const cloudOnline =
    syncStatus.isConnected && syncStatus.isInternetReachable !== false;

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
        console.warn('MQTT broker unreachable', error);
        if (__DEV__) mqttService.markSimulatedConnected();
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
    : null;

  const profileLoading = childrenLoading || (!!activeChildId && latestLoading);

  const goChildren = async () => {
    await HapticService.buttonPress();
    navigation.navigate('Children');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <WelcomeHeader
            name={user?.name || 'Parent'}
            right={
              <View style={styles.notifBtn}>
                <SyncStatusIndicator compact />
              </View>
            }
          />
        </Animated.View>

        <View style={styles.connRow}>
          <View style={styles.connBadge}>
            <View
              style={[
                styles.connDot,
                {
                  backgroundColor: cloudOnline
                    ? colors.status.success
                    : colors.status.warning,
                },
              ]}
            />
            <Text
              style={[
                styles.connText,
                {
                  color: cloudOnline
                    ? colors.status.success
                    : colors.status.warning,
                },
              ]}
            >
              {cloudOnline
                ? 'Cloud: Tersambung'
                : 'Cloud: Offline (Mode Lokal)'}
            </Text>
          </View>
          <View style={styles.connBadge}>
            <View
              style={[
                styles.connDot,
                {
                  backgroundColor: mqttConnected
                    ? isPaired
                      ? colors.status.success
                      : colors.status.warning
                    : colors.status.error,
                },
              ]}
            />
            <Text
              style={[
                styles.connText,
                {
                  color: mqttConnected
                    ? isPaired
                      ? colors.status.success
                      : colors.status.warning
                    : colors.status.error,
                },
              ]}
            >
              {mqttConnected
                ? isPaired
                  ? 'Alat: Terhubung & Siap'
                  : 'Alat: Menunggu Data…'
                : 'Alat: Terputus'}
            </Text>
          </View>
        </View>

        <HeroStatusBanner
          badge={
            activeChild
              ? `Monitoring: ${activeChild.name}`
              : 'Siap pantau pertumbuhan'
          }
          body={
            activeChild
              ? `Monitoring aktif untuk ${activeChild.name}. Cloud Offline = mode lokal (bukan masalah alat).`
              : 'Tambahkan anak untuk mulai pantau pertumbuhan.'
          }
        />

        {childrenError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Gagal memuat data anak</Text>
          </View>
        ) : null}

        {!childrenLoading && children.length === 0 ? (
          <Pressable style={styles.emptyChild} onPress={goChildren}>
            <MaterialCommunityIcons
              name="baby-carriage"
              size={32}
              color={colors.primary.main}
            />
            <Text style={styles.emptyChildTitle}>Belum ada anak</Text>
            <Text style={styles.emptyChildHint}>
              Tambahkan profil anak untuk mulai monitoring.
            </Text>
          </Pressable>
        ) : profileLoading ? (
          <SkeletonLoader variant="card" count={1} style={{ padding: 0 }} />
        ) : activeChild ? (
          <Animated.View entering={FadeInUp.delay(80).duration(450)}>
            <Pressable style={styles.childCard} onPress={goChildren}>
              <View style={styles.childHeader}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons
                    name={
                      activeChild.gender === 'female'
                        ? 'face-woman'
                        : 'face-man'
                    }
                    size={28}
                    color={colors.primary.main}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{activeChild.name}</Text>
                  <Text style={styles.childMeta}>
                    {activeChild.gender === 'female'
                      ? 'Perempuan'
                      : 'Laki-laki'}{' '}
                    · {ageLabelFromDob(activeChild.date_of_birth)}
                  </Text>
                  {latest?.measured_at ? (
                    <Text style={styles.childMeta}>
                      Terakhir {formatMeasuredAt(latest.measured_at)}
                    </Text>
                  ) : null}
                </View>
                {stunting ? (
                  <RiskPill label={stunting.label} color={stunting.color} />
                ) : null}
              </View>

              <View style={styles.metricsRow}>
                <View style={[styles.metricCard, { width: cardW }]}>
                  <Text style={styles.metricLabel}>Berat</Text>
                  <Text style={styles.metricValue}>
                    {latest?.weight_kg != null
                      ? Number(latest.weight_kg).toFixed(1)
                      : '—'}
                    <Text style={styles.metricUnit}> kg</Text>
                  </Text>
                </View>
                <View style={[styles.metricCard, { width: cardW }]}>
                  <Text style={styles.metricLabel}>Tinggi</Text>
                  <Text style={styles.metricValue}>
                    {latest?.height_cm != null
                      ? Number(latest.height_cm).toFixed(1)
                      : '—'}
                    <Text style={styles.metricUnit}> cm</Text>
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(160).duration(450)}>
          <SectionHeading title="Quick Menu" />
          <View style={styles.menuGrid}>
            <QuickMenuTile
              icon="access-point"
              label="Ukur Otomatis"
              primary
              onPress={() => setPairingModalVisible(true)}
            />
            <QuickMenuTile
              icon="wifi"
              label="Ukur Live"
              onPress={() => {
                if (activeChild) {
                  setActiveChild(activeChild);
                }
                navigation.navigate('Measurement');
              }}
            />
            <QuickMenuTile
              icon="scale-bathroom"
              label="Ukur Manual"
              onPress={() => {
                if (activeChild) {
                  setActiveChild(activeChild);
                }
                navigation.navigate('ManualMeasurement');
              }}
            />
            <QuickMenuTile
              icon="chart-line"
              label="Grafik"
              onPress={() => navigation.navigate('Grafik')}
            />
            <QuickMenuTile
              icon="food-apple"
              label="Resep MBG"
              onPress={() => navigation.navigate('RecipeList')}
            />
            <QuickMenuTile
              icon="camera-outline"
              label="AI Vision"
              onPress={() => navigation.navigate('AIVisionStadiometer')}
            />
            <QuickMenuTile
              icon="robot-outline"
              label="AI Chat"
              onPress={() => navigation.navigate('AIAssistant')}
            />
            <QuickMenuTile
              icon="clipboard-list-outline"
              label="AI Menu"
              primary
              onPress={() => setMbgModalVisible(true)}
            />
            <QuickMenuTile
              icon="account-child"
              label="Ganti Anak"
              onPress={goChildren}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(240).duration(450)}>
          <View style={styles.zCard}>
            <Text style={styles.zTitle}>Cek Stunting Otomatis</Text>
            <Text style={styles.zSub}>Berdasarkan standar WHO (TB/U)</Text>
            {!latest || latest.z_score_hfa == null ? (
              <Text style={styles.zMuted}>Belum ada pengukuran</Text>
            ) : (
              <>
                <View style={styles.zBar}>
                  <View
                    style={[
                      styles.zIndicator,
                      {
                        left: `${zScoreBarPercent(latest.z_score_hfa)}%`,
                        backgroundColor:
                          stunting?.color ?? colors.status.warning,
                      },
                    ]}
                  />
                </View>
                <View style={styles.zLabels}>
                  <Text style={styles.zLabel}>-3</Text>
                  <Text style={styles.zLabel}>-2</Text>
                  <Text style={styles.zLabel}>0</Text>
                  <Text style={styles.zLabel}>+2</Text>
                </View>
                <Text
                  style={[
                    styles.zResult,
                    { color: stunting?.color ?? colors.text.onSurface },
                  ]}
                >
                  {stunting
                    ? `${stunting.label} (z = ${Number(latest.z_score_hfa).toFixed(2)})`
                    : `Z-Score ${Number(latest.z_score_hfa).toFixed(2)}`}
                </Text>
              </>
            )}
          </View>
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
        onRetryConnect={async () => {
          await HapticService.buttonPress();
          try {
            await mqttService.connect();
          } catch {
            Alert.alert('Error', 'Gagal menghubungkan ke perangkat IoT');
          }
        }}
      />

      <MBGQuestionnaireModal
        visible={mbgModalVisible}
        onClose={() => setMbgModalVisible(false)}
        childAge={ageMonths ?? undefined}
        childWeight={
          latest?.weight_kg != null ? Number(latest.weight_kg) : undefined
        }
        childHeight={
          latest?.height_cm != null ? Number(latest.height_cm) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 72,
  },
  notifBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    ...shadows.diffusion,
  },
  connRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.lowest,
    ...shadows.diffusion,
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },
  errorBox: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.status.errorContainer,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.status.error,
    fontFamily: typography.fontFamily.semiBold,
  },
  emptyChild: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.section,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyChildTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: typography.fontSize.lg,
    color: colors.primary.main,
  },
  emptyChildHint: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  childCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.section,
    ...shadows.diffusion,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    ...typography.styles.headlineLgMobile,
    fontSize: typography.fontSize.lg,
    color: colors.text.onSurface,
  },
  childMeta: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.stackGap,
  },
  metricCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  metricLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text.onSurface,
  },
  metricUnit: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.primary.main,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackGap,
    marginBottom: spacing.section,
  },
  zCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  zTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: typography.fontSize.lg,
    color: colors.text.onSurface,
  },
  zSub: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  zBar: {
    height: 12,
    backgroundColor: colors.effects.glassPink,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  zIndicator: {
    position: 'absolute',
    top: 0,
    marginLeft: -3,
    width: 6,
    height: 12,
    borderRadius: 3,
  },
  zLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  zLabel: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
  },
  zResult: {
    ...typography.styles.bodyMd,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  zMuted: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
