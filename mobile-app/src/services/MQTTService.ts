/**
 * MQTT Service — Singleton (Paho MQTT over WebSockets)
 * Broker default: EMQX public WSS
 */

import { Client, Message } from 'paho-mqtt';
import type { MQTTMeasurement, MQTTConnectionStatus } from '../types';

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
  process.env.EXPO_PUBLIC_MQTT_TOPIC || 'babygrow/data/sensor';

function parseWsUrl(wsUrl: string): { host: string; port: number; path: string; useSSL: boolean } {
  try {
    const url = new URL(wsUrl);
    const useSSL = url.protocol === 'wss:';
    const port = url.port
      ? Number(url.port)
      : useSSL
        ? 443
        : 80;
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

  private constructor() {
    (['connected', 'disconnected', 'measurement', 'error', 'reconnecting', 'offline'] as EventType[]).forEach(
      (e) => this.eventListeners.set(e, new Set())
    );
  }

  static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
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

  private normalizePayload(raw: Record<string, unknown>): MQTTMeasurement | null {
    const height = Number(raw.tinggi ?? raw.height_cm ?? raw.height ?? 0);
    const weight = Number(raw.berat ?? raw.weight_kg ?? raw.weight ?? 0);
    if (!height || Number.isNaN(height)) return null;

    return {
      weight_kg: Number.isNaN(weight) ? 0 : weight,
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
      const data = JSON.parse(payload) as Record<string, unknown>;
      const measurement = this.normalizePayload(data);
      if (!measurement) return;

      this.latestMeasurement = measurement;
      this.emit('measurement', measurement);
      console.log('[MQTT] measurement', measurement.height_cm, 'cm');
    } catch (error) {
      console.error('[MQTT] parse error', error);
      this.emit('error', error);
    }
  }

  async connect(brokerUrl?: string, clientId?: string): Promise<void> {
    if (this.connected || this.connecting) return;

    this.connecting = true;
    this.brokerUrl = brokerUrl || this.brokerUrl;
    const { host, port, path, useSSL } = parseWsUrl(this.brokerUrl);
    const uniqueClientId =
      clientId || `babygrow_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client(host, port, path, uniqueClientId);

        this.client.onConnectionLost = (response) => {
          this.connected = false;
          this.connecting = false;
          console.warn('[MQTT] connection lost', response?.errorMessage);
          this.emit('disconnected', response);
          this.emit('offline');
        };

        this.client.onMessageArrived = (message) => this.handleMessage(message);

        this.client.connect({
          useSSL,
          timeout: 10,
          keepAliveInterval: 30,
          cleanSession: true,
          reconnect: true,
          onSuccess: () => {
            this.connected = true;
            this.connecting = false;
            console.log('[MQTT] connected', this.brokerUrl);
            this.emit('connected', { broker: this.brokerUrl, clientId: uniqueClientId });
            this.subscribe(this.topic);
            resolve();
          },
          onFailure: (err) => {
            this.connected = false;
            this.connecting = false;
            console.error('[MQTT] connect failed', err?.errorMessage);
            this.emit('error', err);
            // Soft-fail: allow UI to continue; caller may use mock trigger
            reject(new Error(err?.errorMessage || 'MQTT connection failed'));
          },
        });
      } catch (error) {
        this.connecting = false;
        this.emit('error', error);
        reject(error);
      }
    });
  }

  subscribe(topic: string): void {
    if (!this.client || !this.connected) {
      console.warn('[MQTT] subscribe skipped — not connected');
      return;
    }
    if (this.subscriptions.has(topic)) return;

    this.client.subscribe(topic, { qos: 1 });
    this.subscriptions.add(topic);
    console.log('[MQTT] subscribed', topic);
  }

  unsubscribe(topic: string): void {
    if (!this.client || !this.subscriptions.has(topic)) return;
    this.client.unsubscribe(topic);
    this.subscriptions.delete(topic);
  }

  publishCommand(deviceId: string, command: string, params?: Record<string, unknown>): void {
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

  /** Dev/demo helper when hardware is offline */
  triggerMockMeasurement(): void {
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

  /** Soft-connect for demo when broker unreachable */
  markSimulatedConnected(): void {
    this.connected = true;
    this.emit('connected', { broker: this.brokerUrl, simulated: true });
    this.subscriptions.add(this.topic);
  }

  getLatestMeasurement(): MQTTMeasurement | null {
    return this.latestMeasurement;
  }

  disconnect(): void {
    try {
      this.client?.disconnect();
    } catch {
      // ignore
    }
    this.client = null;
    this.connected = false;
    this.subscriptions.clear();
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
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
