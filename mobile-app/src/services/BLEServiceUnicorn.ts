/**
 * BLEServiceUnicorn.ts
 * REAL BLUETOOTH SERVICE dengan UUID "BabyGrow_Alat"
 * ESP32 + VL53L0X Sensor Integration
 * Unicorn 2026 Standard
 */

import { BleManager, Device, Characteristic, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * ═══════════════════════════════════════════════════════
 * INTERFACES
 * ═══════════════════════════════════════════════════════
 */
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  serviceUUIDs?: string[];
}

export interface DeviceInfo {
  name: string;
  deviceId: string;
  type: 'BLE' | 'WiFi';
  batteryLevel: number;
  signalStrength: number;
  status: 'connected' | 'disconnected' | 'connecting';
  ipAddress?: string;
}

export interface MeasurementData {
  height_cm: number;
  weight_kg: number;
  timestamp: Date;
  deviceId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * ═══════════════════════════════════════════════════════
 * BLE SERVICE CLASS
 * ═══════════════════════════════════════════════════════
 */
class BLEService {
  private static instance: BLEService;

  // BLE Manager
  private manager: BleManager;

  // Service & Characteristic UUIDs (ESP32 + VL53L0X)
  private readonly SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'; // ESP32 BLE Service
  private readonly HEIGHT_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // VL53L0X Height
  private readonly WEIGHT_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9'; // Weight (Optional)
  private readonly BATTERY_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa'; // Battery

  // State
  private connectedDevice: Device | null = null;
  private scanning: boolean = false;
  private mockMode: boolean = false; // Set false for REAL BLE

  // Event Listeners
  private listeners: { [event: string]: Array<(data: any) => void> } = {};

  // Latest Measurement Cache
  private latestMeasurement: MeasurementData | null = null;

  // Mock Data Interval
  private mockDataInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.manager = new BleManager();
    this.initializeBLE();
  }

  static getInstance(): BLEService {
    if (!BLEService.instance) {
      BLEService.instance = new BLEService();
    }
    return BLEService.instance;
  }

  /**
   * ═══════════════════════════════════════════════════════
   * INITIALIZATION
   * ═══════════════════════════════════════════════════════
   */
  private async initializeBLE(): Promise<void> {
    try {
      const state = await this.manager.state();
      console.log('[BLE] Initial state:', state);

      this.manager.onStateChange((state) => {
        console.log('[BLE] State changed:', state);
        if (state === State.PoweredOn) {
          console.log('[BLE] ✅ Bluetooth is ready');
        }
      }, true);
    } catch (error) {
      console.error('[BLE] Initialization error:', error);
    }
  }

  /**
   * Request Bluetooth Permissions (Android 12+)
   */
  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          console.error('[BLE] ❌ Permissions not granted');
          return false;
        }

        console.log('[BLE] ✅ All permissions granted');
        return true;
      } catch (error) {
        console.error('[BLE] Permission error:', error);
        return false;
      }
    }

    return true; // iOS automatically handles permissions
  }

  /**
   * ═══════════════════════════════════════════════════════
   * EVENT SYSTEM
   * ═══════════════════════════════════════════════════════
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  private emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(data));
  }

  /**
   * ═══════════════════════════════════════════════════════
   * SCAN FOR DEVICES
   * ═══════════════════════════════════════════════════════
   */
  async scanForDevices(durationSeconds: number = 10): Promise<BLEDevice[]> {
    if (this.mockMode) {
      return this.mockScanForDevices(durationSeconds);
    }

    if (this.scanning) {
      throw new Error('Scan already in progress');
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    this.scanning = true;
    console.log('[BLE] 🔍 Starting scan for "BabyGrow_Alat"...');

    return new Promise((resolve, reject) => {
      const devices: BLEDevice[] = [];
      const deviceIds = new Set<string>();

      this.manager.startDeviceScan(
        null, // Scan all services
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('[BLE] Scan error:', error);
            this.scanning = false;
            reject(error);
            return;
          }

          // Filter for BabyGrow devices
          if (device && device.name && device.name.includes('BabyGrow')) {
            if (!deviceIds.has(device.id)) {
              deviceIds.add(device.id);
              
              const bleDevice: BLEDevice = {
                id: device.id,
                name: device.name,
                rssi: device.rssi || -100,
                serviceUUIDs: device.serviceUUIDs || [],
              };

              devices.push(bleDevice);
              console.log('[BLE] 📡 Found:', bleDevice.name, 'RSSI:', bleDevice.rssi);
            }
          }
        }
      );

      // Stop scan after duration
      setTimeout(() => {
        this.manager.stopDeviceScan();
        this.scanning = false;
        console.log(`[BLE] ✅ Scan complete. Found ${devices.length} device(s)`);
        resolve(devices);
      }, durationSeconds * 1000);
    });
  }

  /**
   * ═══════════════════════════════════════════════════════
   * CONNECT TO DEVICE
   * ═══════════════════════════════════════════════════════
   */
  async connectToDevice(deviceId: string): Promise<void> {
    if (this.mockMode) {
      return this.mockConnectToDevice(deviceId);
    }

    try {
      console.log('[BLE] 🔗 Connecting to:', deviceId);

      // Connect with auto-connect disabled and MTU 512
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        requestMTU: 512,
      });

      console.log('[BLE] ✅ Connected to:', device.name);

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      console.log('[BLE] 🔍 Services discovered');

      this.connectedDevice = device;

      // Build device info
      const deviceInfo: DeviceInfo = {
        name: device.name || 'BabyGrow_Alat',
        deviceId: device.id,
        type: 'BLE',
        batteryLevel: 0,
        signalStrength: device.rssi || -100,
        status: 'connected',
      };

      // Read battery level
      try {
        deviceInfo.batteryLevel = await this.readBatteryLevel(device);
      } catch (error) {
        console.warn('[BLE] Could not read battery:', error);
        deviceInfo.batteryLevel = 0;
      }

      // Emit connected event
      this.emit('connected', deviceInfo);

      // Start monitoring measurements
      await this.startMeasurementMonitoring(device);
    } catch (error) {
      console.error('[BLE] ❌ Connection error:', error);
      this.emit('error', { message: 'Failed to connect', error });
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * MONITOR MEASUREMENTS (Real-time)
   * ═══════════════════════════════════════════════════════
   */
  private async startMeasurementMonitoring(device: Device): Promise<void> {
    console.log('[BLE] 📊 Starting measurement monitoring...');

    try {
      // Monitor HEIGHT characteristic
      device.monitorCharacteristicForService(
        this.SERVICE_UUID,
        this.HEIGHT_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('[BLE] Height monitoring error:', error);
            return;
          }

          if (characteristic && characteristic.value) {
            try {
              const height = this.parseFloat32(characteristic.value);
              console.log('[BLE] 📏 Height:', height.toFixed(1), 'cm');

              // Emit height event
              this.emit('height', height);

              // Update latest measurement
              if (!this.latestMeasurement) {
                this.latestMeasurement = {
                  height_cm: height,
                  weight_kg: 0,
                  timestamp: new Date(),
                  deviceId: device.id,
                  quality: 'good',
                };
              } else {
                this.latestMeasurement.height_cm = height;
                this.latestMeasurement.timestamp = new Date();
              }

              // Emit full measurement
              this.emit('measurement', this.latestMeasurement);
            } catch (parseError) {
              console.error('[BLE] Parse error:', parseError);
            }
          }
        }
      );

      // Monitor WEIGHT characteristic (if available)
      device.monitorCharacteristicForService(
        this.SERVICE_UUID,
        this.WEIGHT_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            // Weight might not be available, don't spam console
            return;
          }

          if (characteristic && characteristic.value) {
            try {
              const weight = this.parseFloat32(characteristic.value);
              console.log('[BLE] ⚖️ Weight:', weight.toFixed(1), 'kg');

              // Emit weight event
              this.emit('weight', weight);

              // Update latest measurement
              if (this.latestMeasurement) {
                this.latestMeasurement.weight_kg = weight;
              }
            } catch (parseError) {
              console.error('[BLE] Weight parse error:', parseError);
            }
          }
        }
      );

      console.log('[BLE] ✅ Monitoring active');
    } catch (error) {
      console.error('[BLE] Monitoring setup error:', error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * READ BATTERY LEVEL
   * ═══════════════════════════════════════════════════════
   */
  private async readBatteryLevel(device: Device): Promise<number> {
    try {
      const characteristic = await device.readCharacteristicForService(
        this.SERVICE_UUID,
        this.BATTERY_CHAR_UUID
      );

      if (characteristic && characteristic.value) {
        const buffer = Buffer.from(characteristic.value, 'base64');
        return buffer.readUInt8(0); // Battery as 0-100%
      }

      return 0;
    } catch (error) {
      console.warn('[BLE] Battery read error:', error);
      return 0;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * PARSE FLOAT32 (Little Endian)
   * ═══════════════════════════════════════════════════════
   */
  private parseFloat32(base64Value: string): number {
    const buffer = Buffer.from(base64Value, 'base64');
    return buffer.readFloatLE(0); // Little-endian float32
  }

  /**
   * ═══════════════════════════════════════════════════════
   * DISCONNECT
   * ═══════════════════════════════════════════════════════
   */
  async disconnectDevice(): Promise<void> {
    if (this.mockMode) {
      this.stopMockDataStream();
      this.connectedDevice = null;
      this.emit('disconnected', {});
      return;
    }

    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        console.log('[BLE] 🔌 Disconnected');
        this.connectedDevice = null;
        this.emit('disconnected', {});
      } catch (error) {
        console.error('[BLE] Disconnect error:', error);
      }
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * UTILITY METHODS
   * ═══════════════════════════════════════════════════════
   */
  getLatestMeasurement(): MeasurementData | null {
    return this.latestMeasurement;
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
    console.log('[BLE] Mock mode:', enabled ? 'ON' : 'OFF');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * MOCK FUNCTIONS (For Testing without Hardware)
   * ═══════════════════════════════════════════════════════
   */
  private async mockScanForDevices(durationSeconds: number): Promise<BLEDevice[]> {
    console.log('[BLE MOCK] 🔍 Scanning...');
    await new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));

    const mockDevices: BLEDevice[] = [
      {
        id: 'MOCK-001',
        name: 'BabyGrow_Alat_Mock',
        rssi: -45,
        serviceUUIDs: [this.SERVICE_UUID],
      },
    ];

    console.log('[BLE MOCK] ✅ Found:', mockDevices.length);
    return mockDevices;
  }

  private async mockConnectToDevice(deviceId: string): Promise<void> {
    console.log('[BLE MOCK] 🔗 Connecting...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const deviceInfo: DeviceInfo = {
      name: 'BabyGrow_Alat_Mock',
      deviceId,
      type: 'BLE',
      batteryLevel: 87,
      signalStrength: -45,
      status: 'connected',
    };

    console.log('[BLE MOCK] ✅ Connected');
    this.emit('connected', deviceInfo);

    // Start mock data stream
    this.startMockDataStream();
  }

  private startMockDataStream(): void {
    let baseHeight = 78.5;
    let baseWeight = 10.2;

    this.mockDataInterval = setInterval(() => {
      // Simulate sensor fluctuations
      const height = baseHeight + (Math.random() - 0.5) * 2;
      const weight = baseWeight + (Math.random() - 0.5) * 0.5;

      this.emit('height', height);
      this.emit('weight', weight);

      this.latestMeasurement = {
        height_cm: height,
        weight_kg: weight,
        timestamp: new Date(),
        deviceId: 'MOCK-001',
        quality: 'good',
      };

      this.emit('measurement', this.latestMeasurement);
    }, 3000); // Update every 3 seconds
  }

  private stopMockDataStream(): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
  }
}

// Export singleton instance
export default BLEService.getInstance();
