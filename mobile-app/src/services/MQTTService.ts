/**
 * 📡 MQTT Service - IoT Integration
 * ESP32 VL53L0X Height Sensor + MQTT Broker
 * Zero-Input UX: Live sensor data auto-fills measurement inputs
 */

import { MQTTMeasurement, MQTTConnectionStatus, ESP32Config } from '../types';

type EventType = 'connected' | 'disconnected' | 'measurement' | 'error' | 'reconnecting' | 'offline';
type EventListener = (data?: any) => void;

class MQTTService {
  private static instance: MQTTService;
  private client: any = null;
  private connected: boolean = false;
  private brokerUrl: string = 'mqtt://broker.emqx.io:1883'; // EMQX Public Broker
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private latestMeasurement: MQTTMeasurement | null = null;

  // Event listener system (Native React Native pattern)
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();

  private constructor() {
    // Initialize event listener maps
    this.eventListeners.set('connected', new Set());
    this.eventListeners.set('disconnected', new Set());
    this.eventListeners.set('measurement', new Set());
    this.eventListeners.set('error', new Set());
    this.eventListeners.set('reconnecting', new Set());
    this.eventListeners.set('offline', new Set());
  }

  static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }


  /**
   * Subscribe to measurement updates (for UI components)
   */
  subscribeMeasurements(callback: (data: MQTTMeasurement) => void): () => void {
    this.on('measurement', callback);
    
    // Return unsubscribe function
    return () => {
      this.off('measurement', callback);
    };
  }

  /**
   * Add event listener (React Native compatible)
   */
  on(event: EventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   */
  off(event: EventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event (internal)
   */
  private emit(event: EventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * 🚀 Manual Mock Measurement Trigger (Only on user request)
   * Called ONLY when "Ukur Otomatis" button is pressed AND device is paired
   */
  public triggerMockMeasurement(): void {
    if (!this.connected) {
      console.warn('⚠️ Device not connected. Cannot trigger measurement.');
      return;
    }

    // Generate ONE measurement per trigger
    const baseHeight = 78.5;
    const heightVariation = (Math.random() * 4) - 2;
    const height = baseHeight + heightVariation;
    const weight = 9.5 + (Math.random() * 1.5);

    const mockData: MQTTMeasurement = {
      weight_kg: parseFloat(weight.toFixed(1)),
      height_cm: parseFloat(height.toFixed(1)),
      timestamp: new Date().toISOString(),
      deviceId: 'ESP32_MOCK_VL53L0X',
      quality: this.assessQuality(height),
      batteryLevel: 85 + Math.floor(Math.random() * 10),
      signalStrength: -45 + Math.floor(Math.random() * 20),
      temperature: 24 + Math.random() * 3,
    };

    this.latestMeasurement = mockData;
    this.emit('measurement', mockData);
    console.log('📡 Manual Measurement Triggered:', mockData.height_cm, 'cm |', mockData.weight_kg, 'kg');
  }

  /**
   * Assess measurement quality based on value
   */
  private assessQuality(height: number): 'excellent' | 'good' | 'fair' | 'poor' {
    // WHO standard range untuk balita 0-5 tahun: ~50-120 cm
    if (height >= 50 && height <= 120) return 'excellent';
    if (height >= 40 && height <= 130) return 'good';
    if (height >= 30 && height <= 140) return 'fair';
    return 'poor';
  }

  /**
   * Get latest measurement (for auto-fill)
   */
  getLatestMeasurement(): MQTTMeasurement | null {
    return this.latestMeasurement;
  }


  /**
   * 🔌 Connect to MQTT Broker (EMQX)
   */
  async connect(
    brokerUrl?: string,
    clientId?: string,
    username?: string,
    password?: string
  ): Promise<void> {
    // Unique Client ID untuk mencegah konflik
    const uniqueClientId = clientId || `babygrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔌 Connecting to MQTT Broker:', this.brokerUrl);
    console.log('📱 Client ID:', uniqueClientId);

    this.brokerUrl = brokerUrl || this.brokerUrl;
    
    // ⚡ SIMULASI KONEKSI UNTUK DEMO
    // (Production: uncomment kode MQTT client di bawah)
    setTimeout(() => {
      this.connected = true;
      console.log('✅ MQTT Connected (Simulated)');
      this.emit('connected', { 
        broker: this.brokerUrl,
        clientId: uniqueClientId,
        timestamp: new Date().toISOString()
      });

      // Auto-subscribe ke topic sensor
      this.subscribe('babygrow/data/sensor');
    }, 1000);

    /*
    // 🔴 PRODUCTION CODE - Uncomment saat ESP32 sudah siap
    const mqtt = require('mqtt/dist/mqtt'); // MQTT.js for React Native
    
    const options = {
      clientId: uniqueClientId,
      username: username || '',
      password: password || '',
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      keepalive: 60,
    };

    this.client = mqtt.connect(this.brokerUrl, options);

    this.client.on('connect', () => {
      console.log('✅ MQTT Connected to:', this.brokerUrl);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { broker: this.brokerUrl, clientId: uniqueClientId });
      
      // Auto subscribe ke topic sensor
      this.subscribe('babygrow/data/sensor');
    });

    this.client.on('error', (error: Error) => {
      console.error('❌ MQTT Error:', error);
      this.connected = false;
      this.emit('error', error);
    });

    this.client.on('offline', () => {
      console.log('⚠️ MQTT Offline');
      this.connected = false;
      this.emit('offline');
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`🔄 MQTT Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.emit('reconnecting', { attempts: this.reconnectAttempts });
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      try {
        const message = payload.toString();
        console.log('📨 MQTT Message:', topic, message);

        // Parse JSON dari ESP32
        const data = JSON.parse(message);

        // Validasi data
        if (topic === 'babygrow/data/sensor' && data.tinggi) {
          const measurement: MQTTMeasurement = {
            weight_kg: data.berat || 0,
            height_cm: data.tinggi,
            timestamp: new Date().toISOString(),
            deviceId: data.deviceId || 'ESP32_VL53L0X',
            quality: this.assessQuality(data.tinggi),
            batteryLevel: data.battery || 100,
            signalStrength: data.rssi || -50,
            temperature: data.temp || 25,
          };

          this.latestMeasurement = measurement;
          this.emit('measurement', measurement);
          console.log('📏 Height received:', data.tinggi, 'cm');
        }
      } catch (error) {
        console.error('❌ Failed to parse MQTT message:', error);
        this.emit('error', error);
      }
    });
    */
  }

  /**
   * Subscribe to topic
   */
  subscribe(topic: string): void {
    if (this.subscriptions.has(topic)) {
      console.log('Already subscribed to:', topic);
      return;
    }

    if (!this.connected) {
      console.error('MQTT not connected. Call connect() first.');
      return;
    }

    // Production: this.client.subscribe(topic);
    this.subscriptions.add(topic);
    console.log('✅ Subscribed to:', topic);
  }

  /**
   * Unsubscribe from topic
   */
  unsubscribe(topic: string): void {
    if (!this.subscriptions.has(topic)) {
      return;
    }

    // Production: this.client.unsubscribe(topic);
    this.subscriptions.delete(topic);
    console.log('Unsubscribed from:', topic);
  }

  /**
   * Publish command to device
   */
  publishCommand(deviceId: string, command: string, params?: any): void {
    const topic = `babygrow/device/${deviceId}/command`;
    
    const message = {
      command_id: `cmd_${Date.now()}`,
      timestamp: new Date().toISOString(),
      command,
      parameters: params || {},
    };

    if (this.connected && this.client) {
      // Production: this.client.publish(topic, JSON.stringify(message), { qos: 1 });
      console.log('[SIMULASI] Published command:', topic, message);
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      // Production: this.client.end();
      this.client = null;
    }

    this.connected = false;
    this.subscriptions.clear();
    console.log('Disconnected from MQTT');
    this.emit('disconnected');
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get connection status details
   */
  getStatus(): MQTTConnectionStatus {
    return {
      connected: this.connected,
      broker: this.brokerUrl,
      lastSeen: this.latestMeasurement?.timestamp,
    };
  }

  /**
   * Clean up all listeners (for unmount)
   */
  removeAllListeners(): void {
    this.eventListeners.forEach(listeners => listeners.clear());
  }
}

export default MQTTService;
