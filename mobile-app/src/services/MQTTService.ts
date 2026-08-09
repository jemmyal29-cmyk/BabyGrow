/**
 * MQTT Service — Singleton (Paho MQTT over WebSockets)
 * Broker: HiveMQ Cloud / EMQX via WSS (env-driven)
 *
 * Persistence contract:
 * - This service ONLY normalizes + emits `measurement` events.
 * - Never insert to Supabase here.
 * - `MeasurementSyncService` owns Z-score (who_standards) + offline queue + insert.
 *
 * Connectivity:
 * - Silent circuit breaker + exponential backoff reconnect (no UI alerts).
 */

import { Client, Message } from 'paho-mqtt';
import type { MQTTMeasurement, MQTTConnectionStatus } from '../types';
import { logger } from '../utils/logger';

type EventType =
  | 'connected'
  | 'disconnected'
  | 'measurement'
  | 'error'
  | 'reconnecting'
  | 'offline';

type EventListener = (data?: unknown) => void;

const DEFAULT_WS_URL =
  process.env.EXPO_PUBLIC_MQTT_WS_URL || 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC =
  process.env.EXPO_PUBLIC_MQTT_TOPIC || 'babygrow/measurements';
const MQTT_USERNAME = process.env.EXPO_PUBLIC_MQTT_USERNAME?.trim() || '';
const MQTT_PASSWORD = process.env.EXPO_PUBLIC_MQTT_PASSWORD?.trim() || '';
const MQTT_CLIENT_PREFIX =
  process.env.EXPO_PUBLIC_MQTT_CLIENT_PREFIX?.trim() || 'babygrow';

/**
 * Allow mock/simulated helpers outside dev builds (e.g. a production demo APK)
 * so a hardware failure on stage still has a software fallback.
 */
const MOCK_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ALLOW_MOCK?.trim() === '1';

/** After this many failures, cool down before retrying */
const CIRCUIT_FAILURE_THRESHOLD = 6;
const CIRCUIT_COOLDOWN_MS = 60_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

function parseWsUrl(wsUrl: string): {
  host: string;
  port: number;
  path: string;
  useSSL: boolean;
} {
  try {
    const url = new URL(wsUrl);
    const useSSL = url.protocol === 'wss:';
    const port = url.port ? Number(url.port) : useSSL ? 443 : 80;
    return {
      host: url.hostname,
      port,
      path: url.pathname || '/mqtt',
      useSSL,
    };
  } catch {
    return { host: 'broker.emqx.io', port: 8084, path: '/mqtt', useSSL: true };
  }
}

class MQTTService {
  private static instance: MQTTService;
  private client: Client | null = null;
  private connected = false;
  private brokerUrl = DEFAULT_WS_URL;
  private topic = DEFAULT_TOPIC;
  private subscriptions = new Set<string>();
  private latestMeasurement: MQTTMeasurement | null = null;
  private eventListeners = new Map<EventType, Set<EventListener>>();
  private connecting = false;
  private intentionalDisconnect = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private circuitOpenUntil = 0;

  private constructor() {
    (
      [
        'connected',
        'disconnected',
        'measurement',
        'error',
        'reconnecting',
        'offline',
      ] as EventType[]
    ).forEach((e) => this.eventListeners.set(e, new Set()));
  }

  static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  getTopic(): string {
    return this.topic;
  }

  setTopic(topic: string): void {
    const next = topic.trim();
    if (!next || next === this.topic) return;
    if (this.connected && this.subscriptions.has(this.topic)) {
      this.unsubscribe(this.topic);
    }
    this.topic = next;
    if (this.connected) this.subscribe(this.topic);
  }

  subscribeMeasurements(callback: (data: MQTTMeasurement) => void): () => void {
    this.on('measurement', callback as EventListener);
    return () => this.off('measurement', callback as EventListener);
  }

  on(event: EventType, listener: EventListener): void {
    this.eventListeners.get(event)?.add(listener);
  }

  off(event: EventType, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: EventType, data?: unknown): void {
    this.eventListeners.get(event)?.forEach((listener) => listener(data));
  }

  private assessQuality(height: number): MQTTMeasurement['quality'] {
    if (height >= 50 && height <= 120) return 'excellent';
    if (height >= 40 && height <= 130) return 'good';
    if (height >= 30 && height <= 140) return 'fair';
    return 'poor';
  }

  /**
   * Normalize ESP32 / legacy payloads.
   * Expected HiveMQ payload:
   *   {"device_id":"BG-NODE-01","weight":14.55,"height":82.1}
   */
  private normalizePayload(raw: Record<string, unknown>): MQTTMeasurement | null {
    const height = Number(raw.tinggi ?? raw.height_cm ?? raw.height ?? 0);
    const weight = Number(raw.berat ?? raw.weight_kg ?? raw.weight ?? 0);
    if (!height || Number.isNaN(height) || height <= 0) return null;

    return {
      weight_kg: Number.isNaN(weight) || weight < 0 ? 0 : weight,
      height_cm: height,
      timestamp: new Date().toISOString(),
      deviceId: String(raw.deviceId ?? raw.device_id ?? 'ESP32_VL53L0X'),
      quality: this.assessQuality(height),
      batteryLevel: raw.battery != null ? Number(raw.battery) : undefined,
      signalStrength: raw.rssi != null ? Number(raw.rssi) : undefined,
      temperature: raw.temp != null ? Number(raw.temp) : undefined,
    };
  }

  private handleMessage(message: Message): void {
    try {
      const payload = message.payloadString;
      if (!payload || typeof payload !== 'string') return;

      const data = JSON.parse(payload) as Record<string, unknown>;
      const measurement = this.normalizePayload(data);
      if (!measurement) {
        logger.debug('[MQTT] ignore payload — missing/invalid height');
        return;
      }

      this.latestMeasurement = measurement;
      this.emit('measurement', measurement);
      logger.debug(
        '[MQTT] measurement',
        measurement.height_cm,
        'cm /',
        measurement.weight_kg,
        'kg'
      );
    } catch (error) {
      // Corrupt JSON must never crash the app — silent log only
      logger.debug('[MQTT] parse error (ignored)', error);
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /** Silent background reconnect with exponential backoff + circuit breaker */
  private scheduleSilentReconnect(): void {
    if (this.intentionalDisconnect) return;
    if (this.connected || this.connecting) return;

    const now = Date.now();
    if (now < this.circuitOpenUntil) {
      const wait = this.circuitOpenUntil - now;
      this.clearReconnectTimer();
      this.reconnectTimer = setTimeout(() => {
        this.scheduleSilentReconnect();
      }, wait);
      return;
    }

    this.clearReconnectTimer();
    this.emit('reconnecting', { attempt: this.reconnectAttempts + 1 });

    const delay = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempts)
    );
    this.reconnectAttempts += 1;

    if (this.reconnectAttempts >= CIRCUIT_FAILURE_THRESHOLD) {
      this.circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      this.reconnectAttempts = 0;
      logger.debug(
        '[MQTT] circuit open — cool down',
        CIRCUIT_COOLDOWN_MS / 1000,
        's'
      );
    }

    this.reconnectTimer = setTimeout(() => {
      void this.connect().catch(() => {
        // Failures stay silent for Posyandu flaky networks
        this.scheduleSilentReconnect();
      });
    }, delay);

    logger.debug('[MQTT] silent reconnect in', delay, 'ms');
  }

  async connect(brokerUrl?: string, clientId?: string): Promise<void> {
    if (this.connected || this.connecting) return;

    this.intentionalDisconnect = false;
    this.connecting = true;
    this.brokerUrl = brokerUrl || this.brokerUrl;
    const { host, port, path, useSSL } = parseWsUrl(this.brokerUrl);
    const uniqueClientId =
      clientId ||
      `${MQTT_CLIENT_PREFIX}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return new Promise((resolve, reject) => {
      try {
        try {
          this.client?.disconnect();
        } catch {
          // ignore
        }

        this.client = new Client(host, Number(port), path, uniqueClientId);

        this.client.onConnectionLost = (response) => {
          this.connected = false;
          this.connecting = false;
          logger.debug('[MQTT] connection lost', response?.errorMessage);
          this.emit('disconnected', response);
          this.emit('offline');
          this.scheduleSilentReconnect();
        };

        this.client.onMessageArrived = (message) => this.handleMessage(message);

        const connectOptions: Record<string, unknown> = {
          useSSL,
          timeout: 10,
          keepAliveInterval: 30,
          cleanSession: true,
          reconnect: true,
          onSuccess: () => {
            this.connected = true;
            this.connecting = false;
            this.reconnectAttempts = 0;
            this.circuitOpenUntil = 0;
            this.clearReconnectTimer();
            logger.debug(
              '[MQTT] connected',
              this.brokerUrl,
              MQTT_USERNAME ? '(auth)' : '(anonymous)'
            );
            this.emit('connected', {
              broker: this.brokerUrl,
              clientId: uniqueClientId,
              authenticated: !!MQTT_USERNAME,
            });
            this.subscribe(this.topic);
            resolve();
          },
          onFailure: (err: { errorMessage?: string }) => {
            this.connected = false;
            this.connecting = false;
            logger.debug('[MQTT] connect failed', err?.errorMessage);
            this.emit('error', err);
            this.scheduleSilentReconnect();
            reject(new Error(err?.errorMessage || 'MQTT connection failed'));
          },
        };

        if (MQTT_USERNAME) {
          connectOptions.userName = MQTT_USERNAME;
          connectOptions.password = MQTT_PASSWORD;
        }

        this.client.connect(connectOptions as Parameters<Client['connect']>[0]);
      } catch (error) {
        this.connecting = false;
        this.emit('error', error);
        this.scheduleSilentReconnect();
        reject(error);
      }
    });
  }

  subscribe(topic: string): void {
    if (!this.client || !this.connected) {
      logger.debug('[MQTT] subscribe skipped — not connected');
      return;
    }
    if (this.subscriptions.has(topic)) return;

    this.client.subscribe(topic, { qos: 1 });
    this.subscriptions.add(topic);
    logger.debug('[MQTT] subscribed', topic);
  }

  unsubscribe(topic: string): void {
    if (!this.client || !this.subscriptions.has(topic)) return;
    this.client.unsubscribe(topic);
    this.subscriptions.delete(topic);
  }

  publishCommand(
    deviceId: string,
    command: string,
    params?: Record<string, unknown>
  ): void {
    if (!this.client || !this.connected) return;

    const topic = `babygrow/device/${deviceId}/command`;
    const body = JSON.stringify({
      command_id: `cmd_${Date.now()}`,
      timestamp: new Date().toISOString(),
      command,
      parameters: params || {},
    });
    const message = new Message(body);
    message.destinationName = topic;
    message.qos = 1;
    this.client.send(message);
  }

  /**
   * Dev/demo helper. Enabled when __DEV__ OR EXPO_PUBLIC_ALLOW_MOCK === '1'
   * so a production APK still has a software safety net if hardware fails live.
   */
  triggerMockMeasurement(): void {
    if (!MOCK_ENABLED) {
      console.warn(
        '[MQTT] triggerMockMeasurement disabled — set EXPO_PUBLIC_ALLOW_MOCK=1 to enable'
      );
      return;
    }
    const height = 78.5 + (Math.random() * 4 - 2);
    const weight = 9.5 + Math.random() * 1.5;
    const mockData: MQTTMeasurement = {
      weight_kg: parseFloat(weight.toFixed(1)),
      height_cm: parseFloat(height.toFixed(1)),
      timestamp: new Date().toISOString(),
      deviceId: 'ESP32_MOCK',
      quality: this.assessQuality(height),
      batteryLevel: 90,
      signalStrength: -50,
      temperature: 25,
    };
    this.latestMeasurement = mockData;
    this.emit('measurement', mockData);
  }

  /** Soft-connect for demo. Enabled when __DEV__ OR EXPO_PUBLIC_ALLOW_MOCK === '1'. */
  markSimulatedConnected(): void {
    if (!MOCK_ENABLED) {
      console.warn(
        '[MQTT] markSimulatedConnected disabled — set EXPO_PUBLIC_ALLOW_MOCK=1 to enable'
      );
      return;
    }
    this.connected = true;
    this.emit('connected', { broker: this.brokerUrl, simulated: true });
    this.subscriptions.add(this.topic);
  }

  getLatestMeasurement(): MQTTMeasurement | null {
    return this.latestMeasurement;
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearReconnectTimer();
    try {
      this.client?.disconnect();
    } catch {
      // ignore
    }
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.subscriptions.clear();
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  isConnecting(): boolean {
    return this.connecting;
  }

  getStatus(): MQTTConnectionStatus {
    return {
      connected: this.connected,
      broker: this.brokerUrl,
      lastSeen: this.latestMeasurement?.timestamp,
    };
  }

  removeAllListeners(): void {
    this.eventListeners.forEach((listeners) => listeners.clear());
  }
}

export default MQTTService;
