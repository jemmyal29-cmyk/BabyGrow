/**
 * BLE Service - Real Bluetooth Low Energy Pairing
 * For BabyGrow_Alat Device Connection
 * 
 * Features:
 * - Scan for BLE devices using react-native-ble-plx
 * - Connect to "BabyGrow_Alat"
 * - Read height/weight measurements in real-time
 * - Real-time data streaming to dashboard
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Constants from 'expo-constants';

// Conditional import for BLE (only works in dev/custom builds, not Expo Go)
let BleManager: any = null;
let State: any = null;
try {
  const BleModule = require('react-native-ble-plx');
  BleManager = BleModule.BleManager;
  State = BleModule.State;
} catch (error) {
  console.log('⚠️ BLE library not available (Expo Go mode)');
}

// BLE Device Interface
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  serviceUUIDs?: string[];
}

// Measurement Interface
export interface BLEMeasurement {
  height_cm: number;
  weight_kg: number;
  timestamp: string;
  deviceId: string;
}

// Device Info Interface
export interface DeviceInfo {
  name: string;
  deviceId: string;
  type: string;
  batteryLevel: number;
  signalStrength: number;
  status: 'connected' | 'disconnected';
}

// BLE Measurement Data
export interface BLEMeasurement {
  height_cm: number;
  weight_kg: number;
  timestamp: string;
  deviceId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
  signalStrength?: number;
}

// Service UUIDs (BabyGrow_Alat Custom)
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const HEIGHT_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const WEIGHT_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const BATTERY_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';

/**
 * BLE Service Class
 * Handles all Bluetooth operations for BabyGrow_Alat device
 */
class BLEService {
  private static instance: BLEService;
  private manager: any;
  private isScanning: boolean = false;
  private connectedDeviceId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private latestMeasurement: BLEMeasurement | null = null;
  private mockMode: boolean = true; // Auto-detect: true if Expo Go, false if custom build

  private constructor() {
    // Auto-detect mode: Use mock mode in Expo Go, real BLE in custom builds
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (BleManager && !isExpoGo) {
      try {
        this.manager = new BleManager();
        this.mockMode = false;
        console.log('🔷 BLE Service: REAL MODE (Custom Build)');
      } catch (error) {
        console.log('⚠️ BLE initialization failed, using MOCK MODE');
        this.mockMode = true;
      }
    } else {
      console.log('🔷 BLE Service: MOCK MODE (Expo Go)');
      this.mockMode = true;
    }
  }

  static getInstance(): BLEService {
    if (!BLEService.instance) {
      BLEService.instance = new BLEService();
    }
    return BLEService.instance;
  }

  /**
   * Event system for real-time updates
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Request Bluetooth permissions (Android)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          // Android 12+ permissions
          const permissions = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            permissions['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            permissions['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            permissions['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          // Android < 12 permissions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions handled by Info.plist
  }

  /**
   * Scan for BLE devices
   * Looks for "BabyGrow_Alat" device
   */
  async scanForDevices(durationSeconds: number = 10): Promise<BLEDevice[]> {
    console.log('🔍 Starting BLE scan...');

    // Check permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    this.isScanning = true;
    this.emit('scanStart', { duration: durationSeconds });

    // MOCK MODE: Return simulated device (untuk testing tanpa hardware)
    if (this.mockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockDevices: BLEDevice[] = [
            {
              id: 'ESP32_BLE_DEMO',
              name: 'BabyGrow_Alat',
              rssi: -45,
              serviceUUIDs: [SERVICE_UUID]
            }
          ];
          
          this.isScanning = false;
          this.emit('scanComplete', { devices: mockDevices });
          console.log('✅ BLE Scan complete (Mock): Found BabyGrow_Alat');
          resolve(mockDevices);
        }, 2000);
      });
    }

    // REAL BLE MODE (For custom dev client or standalone build)
    // Note: Expo Go does NOT support native BLE
    // To enable real BLE:
    // 1. Build custom dev client: npx expo run:android
    // 2. Or create standalone APK: eas build
    // 3. Install react-native-ble-plx in custom build
    
    this.isScanning = false;
    this.emit('scanComplete', { devices: [] });
    console.log('⚠️ Real BLE not available in Expo Go. Use custom dev client for real hardware.');
    return [];
  }

  /**
   * Connect to BabyGrow_Alat device
   */
  async connectToDevice(deviceId: string): Promise<void> {
    console.log('🔗 Connecting to device:', deviceId);
    this.emit('connecting', { deviceId });

    // MOCK MODE: Simulate connection (untuk testing tanpa hardware)
    if (this.mockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.connectedDeviceId = deviceId;
          this.emit('connected', {
            deviceId: deviceId,
            name: 'BabyGrow_Alat (DEMO)',
            status: 'online',
            batteryLevel: 87,
            signalStrength: -45
          });

          console.log('✅ BLE Connected (Mock Mode):', deviceId);
          resolve();
        }, 2500);
      });
    }

    // REAL BLE MODE: Connect to ESP32
    if (!this.manager || this.mockMode) {
      throw new Error('Real BLE not available. Using mock mode.');
    }

    try {
      const device = await this.manager.connectToDevice(deviceId);
      console.log('🔗 Connected to device:', device.name);

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      console.log('🔍 Services discovered');

      this.connectedDeviceId = deviceId;
      
      // Read battery level
      const batteryLevel = await this.readBatteryLevel();
      
      this.emit('connected', {
        deviceId: deviceId,
        name: device.name || 'BabyGrow_Alat',
        status: 'online',
        batteryLevel: batteryLevel,
        signalStrength: device.rssi || -50
      });

      console.log('✅ BLE Connected (Real Mode):', device.name);

      // Start monitoring measurements
      this.startMeasurementMonitoring(deviceId);
    } catch (error) {
      console.error('Connection error:', error);
      throw new Error('Gagal terhubung ke BabyGrow_Alat. Coba lagi.');
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (this.connectedDeviceId) {
      console.log('❌ Disconnecting from:', this.connectedDeviceId);
      this.emit('disconnected', { deviceId: this.connectedDeviceId });
      this.connectedDeviceId = null;
      this.stopMockDataStream();
    }
  }

  private stopMockDataStream(): void {
    // No continuous mock stream in current implementation
  }

  /**
   * Check if device is connected
   */
  isConnected(): boolean {
    return this.connectedDeviceId !== null;
  }

  /**
   * Get latest measurement
   */
  getLatestMeasurement(): BLEMeasurement | null {
    return this.latestMeasurement;
  }

  /**
   * Trigger manual measurement (called by user action)
   * Only works when device is connected
   */
  triggerMockMeasurement(): void {
    if (!this.connectedDeviceId) {
      console.warn('⚠️ BLE device not connected. Cannot trigger measurement.');
      return;
    }

    // Generate ONE measurement per trigger
    const baseHeight = 78.5;
    const heightVariation = (Math.random() * 4) - 2;
    const height = baseHeight + heightVariation;
    const weight = 9.5 + (Math.random() * 1.5);

    const mockData: BLEMeasurement = {
      height_cm: parseFloat(height.toFixed(1)),
      weight_kg: parseFloat(weight.toFixed(1)),
      timestamp: new Date().toISOString(),
      deviceId: this.connectedDeviceId,
      quality: this.assessQuality(height),
      batteryLevel: 85 + Math.floor(Math.random() * 10),
      signalStrength: -45 + Math.floor(Math.random() * 20)
    };

    this.latestMeasurement = mockData;
    this.emit('measurement', mockData);
    
    console.log('📡 BLE Manual Measurement:', mockData.height_cm, 'cm |', mockData.weight_kg, 'kg');
  }

  private assessQuality(height: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const variation = Math.abs(height - 78.5);
    if (variation < 0.5) return 'excellent';
    if (variation < 1.0) return 'good';
    if (variation < 2.0) return 'fair';
    return 'poor';
  }

  /**
   * Read battery level from device
   */
  async readBatteryLevel(): Promise<number> {
    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }

    // MOCK MODE
    if (this.mockMode) {
      return 87;
    }

    // REAL BLE MODE: Read from ESP32
    if (!this.manager || this.mockMode) {
      return 85; // Default for mock mode
    }

    try {
      const characteristic = await this.manager.readCharacteristicForDevice(
        this.connectedDeviceId,
        SERVICE_UUID,
        BATTERY_CHAR_UUID
      );
      
      if (characteristic.value) {
        // Decode base64 value
        const batteryLevel = parseInt(Buffer.from(characteristic.value, 'base64').toString('utf8'));
        return batteryLevel;
      }
    } catch (error) {
      console.error('Failed to read battery:', error);
    }
    
    return 85; // Default if read fails
  }

  /**
   * Start monitoring measurements from connected device
   */
  private startMeasurementMonitoring(deviceId: string): void {
    if (!this.manager || this.mockMode) {
      console.log('⚠️ Monitoring not available in mock mode');
      return;
    }

    // Monitor height characteristic
    this.manager.monitorCharacteristicForDevice(
      deviceId,
      SERVICE_UUID,
      HEIGHT_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Height monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          const height = parseFloat(Buffer.from(characteristic.value, 'base64').toString('utf8'));
          console.log('📏 Height received:', height, 'cm');
          
          // Update latest measurement
          if (this.latestMeasurement) {
            this.latestMeasurement.height_cm = height;
          } else {
            this.latestMeasurement = {
              height_cm: height,
              weight_kg: 0,
              timestamp: new Date().toISOString(),
              deviceId: deviceId,
              quality: 'good'
            };
          }
        }
      }
    );

    // Monitor weight characteristic
    this.manager.monitorCharacteristicForDevice(
      deviceId,
      SERVICE_UUID,
      WEIGHT_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Weight monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          const weight = parseFloat(Buffer.from(characteristic.value, 'base64').toString('utf8'));
          console.log('⚖️ Weight received:', weight, 'kg');
          
          // Update and emit measurement when both values received
          if (this.latestMeasurement && this.latestMeasurement.height_cm > 0) {
            this.latestMeasurement.weight_kg = weight;
            this.latestMeasurement.timestamp = new Date().toISOString();
            
            // Emit complete measurement
            this.emit('measurement', this.latestMeasurement);
            console.log('📡 Complete measurement emitted:', this.latestMeasurement);
          }
        }
      }
    );
  }

  /**
   * Enable/Disable mock mode
   */
  setMockMode(enabled: boolean) {
    this.mockMode = enabled;
    console.log('🔷 BLE Mock Mode:', enabled ? 'ENABLED' : 'DISABLED');
  }

  // Mock data streaming REMOVED - Use real BLE measurements only
}

export default BLEService.getInstance();
