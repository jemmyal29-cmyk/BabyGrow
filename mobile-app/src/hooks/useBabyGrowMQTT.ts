/**
 * useBabyGrowMQTT — React facade over MQTTService singleton
 *
 * UI must NOT talk to Paho/HiveMQ directly. This hook:
 * - auto-connects (optional)
 * - exposes connectionStatus / liveWeight / liveHeight
 * - relies on MQTTService silent circuit-breaker reconnect
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import MQTTService from '../services/MQTTService';
import type { MQTTMeasurement } from '../types';

export type MQTTConnectionUiStatus =
  | 'Connecting'
  | 'Connected'
  | 'Disconnected';

export interface UseBabyGrowMQTTOptions {
  /** Connect on mount (default true) */
  autoConnect?: boolean;
  /** Override EXPO_PUBLIC_MQTT_TOPIC for this screen */
  topic?: string;
  /** Disconnect when the hook unmounts (default false — share singleton) */
  disconnectOnUnmount?: boolean;
}

export interface UseBabyGrowMQTTResult {
  connectionStatus: MQTTConnectionUiStatus;
  liveWeight: number;
  liveHeight: number;
  deviceId: string | null;
  lastUpdatedAt: string | null;
  topic: string;
  broker: string;
  isOnline: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Dev-only mock tick */
  triggerMockMeasurement: () => void;
}

function mapInitialStatus(service: MQTTService): MQTTConnectionUiStatus {
  if (service.isConnected()) return 'Connected';
  if (service.isConnecting()) return 'Connecting';
  return 'Disconnected';
}

export function useBabyGrowMQTT(
  options: UseBabyGrowMQTTOptions = {}
): UseBabyGrowMQTTResult {
  const {
    autoConnect = true,
    topic,
    disconnectOnUnmount = false,
  } = options;

  const service = useMemo(() => MQTTService.getInstance(), []);

  const [connectionStatus, setConnectionStatus] =
    useState<MQTTConnectionUiStatus>(() => mapInitialStatus(service));
  const [liveWeight, setLiveWeight] = useState(0);
  const [liveHeight, setLiveHeight] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const applyMeasurement = useCallback((data: MQTTMeasurement) => {
    if (typeof data.weight_kg === 'number' && data.weight_kg >= 0) {
      setLiveWeight(data.weight_kg);
    }
    if (typeof data.height_cm === 'number' && data.height_cm > 0) {
      setLiveHeight(data.height_cm);
    }
    if (data.deviceId) setDeviceId(data.deviceId);
    if (data.timestamp) setLastUpdatedAt(data.timestamp);
  }, []);

  const connect = useCallback(async () => {
    setConnectionStatus((prev) =>
      prev === 'Connected' ? prev : 'Connecting'
    );
    try {
      await service.connect();
    } catch {
      // Silent: circuit breaker in MQTTService will retry in background
      setConnectionStatus((prev) =>
        service.isConnected() ? 'Connected' : 'Disconnected'
      );
    }
  }, [service]);

  const disconnect = useCallback(() => {
    service.disconnect();
    setConnectionStatus('Disconnected');
  }, [service]);

  useEffect(() => {
    if (topic) service.setTopic(topic);

    const latest = service.getLatestMeasurement();
    if (latest) applyMeasurement(latest);

    const onConnected = () => setConnectionStatus('Connected');
    const onDisconnected = () => setConnectionStatus('Disconnected');
    const onReconnecting = () => setConnectionStatus('Connecting');
    const onMeasurement = (raw?: unknown) => {
      if (!raw || typeof raw !== 'object') return;
      applyMeasurement(raw as MQTTMeasurement);
    };

    service.on('connected', onConnected);
    service.on('disconnected', onDisconnected);
    service.on('offline', onDisconnected);
    service.on('reconnecting', onReconnecting);
    service.on('measurement', onMeasurement);

    setConnectionStatus(mapInitialStatus(service));

    if (autoConnect && !service.isConnected()) {
      setConnectionStatus('Connecting');
      void connect();
    }

    return () => {
      service.off('connected', onConnected);
      service.off('disconnected', onDisconnected);
      service.off('offline', onDisconnected);
      service.off('reconnecting', onReconnecting);
      service.off('measurement', onMeasurement);
      if (disconnectOnUnmount) {
        service.disconnect();
      }
    };
  }, [autoConnect, topic, service, applyMeasurement, connect, disconnectOnUnmount]);

  return {
    connectionStatus,
    liveWeight,
    liveHeight,
    deviceId,
    lastUpdatedAt,
    topic: service.getTopic(),
    broker: service.getStatus().broker,
    isOnline: connectionStatus === 'Connected',
    connect,
    disconnect,
    triggerMockMeasurement: () => service.triggerMockMeasurement(),
  };
}

export default useBabyGrowMQTT;
