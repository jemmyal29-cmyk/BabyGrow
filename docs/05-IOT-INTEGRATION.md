# BabyGrow - IoT Integration Guide

## 📡 IoT Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    IoT ECOSYSTEM                             │
│                                                              │
│  ┌────────────────┐      ┌─────────────────┐               │
│  │  BLE Devices   │      │  WiFi Devices   │               │
│  │                │      │                 │               │
│  │  • Smart Scale │      │  • WiFi Scale   │               │
│  │  • Height      │      │  • Height Meter │               │
│  │    Meter       │      │                 │               │
│  └────────┬───────┘      └────────┬────────┘               │
│           │                       │                         │
│           │ BLE                   │ MQTT/TLS                │
│           │                       │                         │
│  ┌────────▼───────────────────────▼────────┐               │
│  │       Mobile App (React Native)         │               │
│  │  • BLE Manager                          │               │
│  │  • MQTT Client                          │               │
│  │  • Data Validation                      │               │
│  │  • Local Storage                        │               │
│  └────────┬────────────────────────────────┘               │
│           │                                                 │
│           │ HTTPS/WSS                                      │
│           │                                                 │
│  ┌────────▼────────────────────────────────┐               │
│  │         Backend API                     │               │
│  │  • IoT Service                          │               │
│  │  • MQTT Broker Integration              │               │
│  │  • WebSocket Server                     │               │
│  └────────┬────────────────────────────────┘               │
│           │                                                 │
│  ┌────────▼────────────────────────────────┐               │
│  │      Database & AI Analysis             │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Connection Protocols

### 1. Bluetooth Low Energy (BLE)

**Use Case**: Direct device-to-phone measurement  
**Range**: Up to 10 meters  
**Power**: Very low power consumption  

#### BLE Device Specification

```javascript
// BLE Service & Characteristic UUIDs
const BLE_SPECS = {
  // Primary Service UUID (Custom for BabyGrow)
  SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  
  // Characteristics
  CHARACTERISTICS: {
    // Weight measurement (Read, Notify)
    WEIGHT: {
      UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
      PROPERTIES: ['Read', 'Notify'],
      FORMAT: 'Float32', // Kilograms
      RESOLUTION: 0.01   // 10 grams
    },
    
    // Height measurement (Read, Notify)
    HEIGHT: {
      UUID: '0000fff2-0000-1000-8000-00805f9b34fb',
      PROPERTIES: ['Read', 'Notify'],
      FORMAT: 'Float32', // Centimeters
      RESOLUTION: 0.1    // 1 millimeter
    },
    
    // Battery level (Read)
    BATTERY: {
      UUID: '0000fff3-0000-1000-8000-00805f9b34fb',
      PROPERTIES: ['Read'],
      FORMAT: 'Uint8'    // Percentage 0-100
    },
    
    // Device control (Write)
    CONTROL: {
      UUID: '0000fff4-0000-1000-8000-00805f9b34fb',
      PROPERTIES: ['Write'],
      COMMANDS: {
        START_MEASURE: 0x01,
        STOP_MEASURE: 0x02,
        CALIBRATE: 0x03,
        RESET: 0x04
      }
    },
    
    // Status (Read, Notify)
    STATUS: {
      UUID: '0000fff5-0000-1000-8000-00805f9b34fb',
      PROPERTIES: ['Read', 'Notify'],
      STATES: {
        IDLE: 0x00,
        MEASURING: 0x01,
        COMPLETE: 0x02,
        ERROR: 0xFF
      }
    }
  }
};
```

#### BLE Data Format

```javascript
// Weight Data Packet (4 bytes)
// [0-3]: Float32 - Weight in kg
// Example: 10.25 kg
const weightPacket = new ArrayBuffer(4);
const weightView = new DataView(weightPacket);
weightView.setFloat32(0, 10.25, true); // little-endian

// Height Data Packet (4 bytes)
// [0-3]: Float32 - Height in cm
// Example: 78.5 cm
const heightPacket = new ArrayBuffer(4);
const heightView = new DataView(heightPacket);
heightView.setFloat32(0, 78.5, true);

// Combined Measurement Packet (12 bytes)
// [0-3]: Float32 - Weight (kg)
// [4-7]: Float32 - Height (cm)
// [8-11]: Uint32 - Timestamp (Unix)
const combinedPacket = new ArrayBuffer(12);
const view = new DataView(combinedPacket);
view.setFloat32(0, 10.25, true);
view.setFloat32(4, 78.5, true);
view.setUint32(8, Date.now() / 1000, true);
```

#### BLE Implementation (React Native)

```typescript
// src/services/BLEService.ts

import BleManager, {
  Peripheral,
  BleDisconnectPeripheralEvent,
} from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export interface Measurement {
  weight_kg: number;
  height_cm: number;
  timestamp: Date;
  deviceId: string;
}

export class BLEService {
  private static instance: BLEService;
  private scanning: boolean = false;
  private connectedDeviceId: string | null = null;

  private readonly SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
  private readonly WEIGHT_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
  private readonly HEIGHT_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
  private readonly BATTERY_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';
  private readonly STATUS_CHAR_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';

  private constructor() {
    this.initialize();
  }

  static getInstance(): BLEService {
    if (!BLEService.instance) {
      BLEService.instance = new BLEService();
    }
    return BLEService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await BleManager.start({ showAlert: false });
      
      // Setup listeners
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        this.handleDiscoverPeripheral
      );
      
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        this.handleDisconnectedPeripheral
      );

      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        this.handleUpdateValue
      );

      console.log('BLE Manager initialized');
    } catch (error) {
      console.error('BLE initialization error:', error);
      throw error;
    }
  }

  async scanForDevices(durationSeconds: number = 10): Promise<Peripheral[]> {
    if (this.scanning) {
      throw new Error('Scan already in progress');
    }

    this.scanning = true;
    const devices: Peripheral[] = [];

    try {
      // Start scanning (only look for BabyGrow devices)
      await BleManager.scan([this.SERVICE_UUID], durationSeconds, true);

      // Wait for scan to complete
      await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));

      // Get discovered peripherals
      const peripherals = await BleManager.getDiscoveredPeripherals();
      
      // Filter BabyGrow devices
      const babyGrowDevices = peripherals.filter(
        device => device.name?.startsWith('BabyGrow-')
      );

      this.scanning = false;
      return babyGrowDevices;
    } catch (error) {
      this.scanning = false;
      throw error;
    }
  }

  async connectToDevice(deviceId: string, pinCode?: string): Promise<void> {
    try {
      // Connect to peripheral
      await BleManager.connect(deviceId);
      console.log('Connected to device:', deviceId);

      // Retrieve services
      const peripheralInfo = await BleManager.retrieveServices(deviceId);
      console.log('Services retrieved:', peripheralInfo);

      // Start notifications for weight, height, and status
      await BleManager.startNotification(
        deviceId,
        this.SERVICE_UUID,
        this.WEIGHT_CHAR_UUID
      );

      await BleManager.startNotification(
        deviceId,
        this.SERVICE_UUID,
        this.HEIGHT_CHAR_UUID
      );

      await BleManager.startNotification(
        deviceId,
        this.SERVICE_UUID,
        this.STATUS_CHAR_UUID
      );

      this.connectedDeviceId = deviceId;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      await BleManager.disconnect(deviceId);
      this.connectedDeviceId = null;
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }

  async readMeasurement(deviceId: string): Promise<Measurement> {
    try {
      // Read weight
      const weightData = await BleManager.read(
        deviceId,
        this.SERVICE_UUID,
        this.WEIGHT_CHAR_UUID
      );

      // Read height
      const heightData = await BleManager.read(
        deviceId,
        this.SERVICE_UUID,
        this.HEIGHT_CHAR_UUID
      );

      const weight = this.parseFloat32(weightData);
      const height = this.parseFloat32(heightData);

      return {
        weight_kg: weight,
        height_cm: height,
        timestamp: new Date(),
        deviceId: deviceId,
      };
    } catch (error) {
      console.error('Read measurement error:', error);
      throw error;
    }
  }

  async getBatteryLevel(deviceId: string): Promise<number> {
    try {
      const batteryData = await BleManager.read(
        deviceId,
        this.SERVICE_UUID,
        this.BATTERY_CHAR_UUID
      );

      return batteryData[0]; // Uint8
    } catch (error) {
      console.error('Read battery error:', error);
      throw error;
    }
  }

  private parseFloat32(data: number[]): number {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    
    data.forEach((byte, index) => {
      view.setUint8(index, byte);
    });

    return view.getFloat32(0, true); // little-endian
  }

  private handleDiscoverPeripheral = (peripheral: Peripheral) => {
    console.log('Discovered peripheral:', peripheral);
    // Emit event or update state
  };

  private handleDisconnectedPeripheral = (
    data: BleDisconnectPeripheralEvent
  ) => {
    console.log('Disconnected from peripheral:', data.peripheral);
    if (this.connectedDeviceId === data.peripheral) {
      this.connectedDeviceId = null;
    }
  };

  private handleUpdateValue = (data: any) => {
    console.log('Characteristic value updated:', data);
    // Handle notifications (weight/height updates)
  };

  async isConnected(deviceId: string): Promise<boolean> {
    try {
      return await BleManager.isPeripheralConnected(deviceId, []);
    } catch {
      return false;
    }
  }
}

export default BLEService.getInstance();
```

### 2. MQTT over WiFi

**Use Case**: WiFi-enabled devices, remote monitoring  
**Range**: WiFi coverage area  
**Power**: Higher power, needs charging  

#### MQTT Topic Structure

```
babygrow/
├── device/
│   ├── {device_id}/
│   │   ├── measurement        # Device publishes measurements
│   │   ├── status             # Device publishes status
│   │   ├── command            # Backend sends commands
│   │   └── response           # Device sends command responses
│   
├── user/
│   └── {user_id}/
│       └── notifications      # Backend sends notifications
```

#### MQTT Message Formats

```json
// Measurement Message
// Topic: babygrow/device/{device_id}/measurement
{
  "device_id": "BG-WIFI-SC-001",
  "timestamp": "2025-12-23T10:30:00Z",
  "type": "measurement",
  "data": {
    "weight_kg": 10.25,
    "height_cm": 78.5,
    "temperature_c": 23.5,
    "battery_level": 87
  },
  "metadata": {
    "firmware_version": "1.2.3",
    "measurement_quality": "good",
    "signal_strength_dbm": -45
  }
}

// Status Message
// Topic: babygrow/device/{device_id}/status
{
  "device_id": "BG-WIFI-SC-001",
  "timestamp": "2025-12-23T10:30:00Z",
  "type": "status",
  "status": "online",
  "battery_level": 87,
  "signal_strength": -45,
  "uptime_seconds": 3600
}

// Command Message (Backend → Device)
// Topic: babygrow/device/{device_id}/command
{
  "command_id": "cmd-12345",
  "timestamp": "2025-12-23T10:30:00Z",
  "command": "calibrate",
  "parameters": {
    "weight_reference_kg": 10.0
  }
}

// Response Message (Device → Backend)
// Topic: babygrow/device/{device_id}/response
{
  "command_id": "cmd-12345",
  "timestamp": "2025-12-23T10:30:05Z",
  "status": "success",
  "message": "Calibration completed"
}
```

#### MQTT Implementation (Mobile App)

```typescript
// src/services/MQTTService.ts

import { Client, Message } from 'mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MQTTConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId: string;
}

export class MQTTService {
  private static instance: MQTTService;
  private client: Client | null = null;
  private connected: boolean = false;

  private constructor() {}

  static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  async connect(config: MQTTConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Using MQTT.js (works with React Native)
        // Note: Install: npm install mqtt react-native-tcp-socket
        const mqtt = require('mqtt');

        this.client = mqtt.connect(config.brokerUrl, {
          clientId: config.clientId,
          username: config.username,
          password: config.password,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000,
          keepalive: 60,
        });

        this.client.on('connect', () => {
          console.log('MQTT connected');
          this.connected = true;
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('MQTT error:', error);
          this.connected = false;
          reject(error);
        });

        this.client.on('message', this.handleMessage);

        this.client.on('offline', () => {
          console.log('MQTT offline');
          this.connected = false;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToDevice(deviceId: string): void {
    if (!this.client || !this.connected) {
      throw new Error('MQTT not connected');
    }

    const topics = [
      `babygrow/device/${deviceId}/measurement`,
      `babygrow/device/${deviceId}/status`,
      `babygrow/device/${deviceId}/response`,
    ];

    this.client.subscribe(topics, (error) => {
      if (error) {
        console.error('Subscribe error:', error);
      } else {
        console.log('Subscribed to device topics:', deviceId);
      }
    });
  }

  unsubscribeFromDevice(deviceId: string): void {
    if (!this.client) return;

    const topics = [
      `babygrow/device/${deviceId}/measurement`,
      `babygrow/device/${deviceId}/status`,
      `babygrow/device/${deviceId}/response`,
    ];

    this.client.unsubscribe(topics);
  }

  sendCommand(deviceId: string, command: any): void {
    if (!this.client || !this.connected) {
      throw new Error('MQTT not connected');
    }

    const topic = `babygrow/device/${deviceId}/command`;
    const message = JSON.stringify(command);

    this.client.publish(topic, message, { qos: 1 });
  }

  private handleMessage = (topic: string, payload: Buffer) => {
    try {
      const message = JSON.parse(payload.toString());
      console.log('MQTT message received:', topic, message);

      // Parse topic
      const parts = topic.split('/');
      const messageType = parts[parts.length - 1];

      // Handle different message types
      switch (messageType) {
        case 'measurement':
          this.handleMeasurement(message);
          break;
        case 'status':
          this.handleStatus(message);
          break;
        case 'response':
          this.handleResponse(message);
          break;
      }
    } catch (error) {
      console.error('Message parse error:', error);
    }
  };

  private handleMeasurement(data: any) {
    // Emit event or update Redux store
    console.log('New measurement:', data);
  }

  private handleStatus(data: any) {
    // Update device status
    console.log('Device status:', data);
  }

  private handleResponse(data: any) {
    // Handle command response
    console.log('Command response:', data);
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default MQTTService.getInstance();
```

## ✅ Data Validation

### Validation Rules

```typescript
// src/utils/measurementValidation.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MeasurementData {
  weight_kg: number;
  height_cm: number;
  age_months: number;
  gender: 'male' | 'female';
  previousMeasurements?: Array<{
    weight_kg: number;
    height_cm: number;
    measured_at: Date;
  }>;
}

export class MeasurementValidator {
  // WHO-based acceptable ranges
  private static readonly RANGES = {
    weight: {
      min: 2.0,    // kg (premature baby minimum)
      max: 30.0,   // kg (unlikely for toddler)
    },
    height: {
      min: 40.0,   // cm (premature baby minimum)
      max: 130.0,  // cm (5 years old maximum)
    },
    // Maximum change between measurements (per month)
    maxChange: {
      weight: 1.0,  // kg per month
      height: 3.0,  // cm per month
    }
  };

  static validate(data: MeasurementData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Range Validation
    if (data.weight_kg < this.RANGES.weight.min) {
      errors.push(`Berat terlalu rendah (min: ${this.RANGES.weight.min} kg)`);
    }
    if (data.weight_kg > this.RANGES.weight.max) {
      errors.push(`Berat terlalu tinggi (max: ${this.RANGES.weight.max} kg)`);
    }

    if (data.height_cm < this.RANGES.height.min) {
      errors.push(`Tinggi terlalu rendah (min: ${this.RANGES.height.min} cm)`);
    }
    if (data.height_cm > this.RANGES.height.max) {
      errors.push(`Tinggi terlalu tinggi (max: ${this.RANGES.height.max} cm)`);
    }

    // 2. Precision Validation
    if (!this.isReasonablePrecision(data.weight_kg, 2)) {
      warnings.push('Berat badan memiliki presisi yang tidak wajar');
    }
    if (!this.isReasonablePrecision(data.height_cm, 1)) {
      warnings.push('Tinggi badan memiliki presisi yang tidak wajar');
    }

    // 3. Historical Comparison
    if (data.previousMeasurements && data.previousMeasurements.length > 0) {
      const lastMeasurement = data.previousMeasurements[0];
      const timeDiff = this.getMonthsDifference(
        lastMeasurement.measured_at,
        new Date()
      );

      // Weight change validation
      const weightChange = Math.abs(data.weight_kg - lastMeasurement.weight_kg);
      const maxWeightChange = this.RANGES.maxChange.weight * timeDiff;

      if (weightChange > maxWeightChange) {
        warnings.push(
          `Perubahan berat badan tidak wajar (${weightChange.toFixed(1)} kg dalam ${timeDiff.toFixed(1)} bulan)`
        );
      }

      // Height decrease check
      if (data.height_cm < lastMeasurement.height_cm - 1) {
        warnings.push(
          `Tinggi badan berkurang ${(lastMeasurement.height_cm - data.height_cm).toFixed(1)} cm dari pengukuran sebelumnya`
        );
      }

      // Height change validation
      const heightChange = data.height_cm - lastMeasurement.height_cm;
      const maxHeightChange = this.RANGES.maxChange.height * timeDiff;

      if (heightChange > maxHeightChange) {
        warnings.push(
          `Pertambahan tinggi badan tidak wajar (${heightChange.toFixed(1)} cm dalam ${timeDiff.toFixed(1)} bulan)`
        );
      }
    }

    // 4. Weight-Height Ratio
    const ratio = data.weight_kg / (data.height_cm / 100);
    if (ratio < 3 || ratio > 25) {
      warnings.push('Rasio berat/tinggi badan tidak wajar');
    }

    // 5. Age-appropriate validation
    const expectedRanges = this.getExpectedRangeForAge(
      data.age_months,
      data.gender
    );

    if (data.weight_kg < expectedRanges.weight.min * 0.5) {
      errors.push('Berat badan terlalu rendah untuk usia ini');
    }
    if (data.weight_kg > expectedRanges.weight.max * 1.5) {
      warnings.push('Berat badan sangat tinggi untuk usia ini');
    }

    if (data.height_cm < expectedRanges.height.min * 0.7) {
      errors.push('Tinggi badan terlalu rendah untuk usia ini');
    }
    if (data.height_cm > expectedRanges.height.max * 1.2) {
      warnings.push('Tinggi badan sangat tinggi untuk usia ini');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static isReasonablePrecision(value: number, maxDecimals: number): boolean {
    const str = value.toString();
    const decimalPart = str.split('.')[1];
    
    if (!decimalPart) return true;
    
    return decimalPart.length <= maxDecimals;
  }

  private static getMonthsDifference(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return diff / (1000 * 60 * 60 * 24 * 30.44); // Average month length
  }

  private static getExpectedRangeForAge(
    ageMonths: number,
    gender: 'male' | 'female'
  ): { weight: { min: number; max: number }; height: { min: number; max: number } } {
    // Simplified WHO standards (use actual WHO data in production)
    // These are rough estimates for validation purposes
    const baseWeight = 3.3; // kg at birth
    const baseHeight = 50.0; // cm at birth

    const weightGrowthRate = gender === 'male' ? 0.5 : 0.45; // kg/month
    const heightGrowthRate = gender === 'male' ? 2.5 : 2.3; // cm/month

    const expectedWeight = baseWeight + (ageMonths * weightGrowthRate);
    const expectedHeight = baseHeight + (ageMonths * heightGrowthRate);

    return {
      weight: {
        min: expectedWeight * 0.7,
        max: expectedWeight * 1.3,
      },
      height: {
        min: expectedHeight * 0.85,
        max: expectedHeight * 1.15,
      },
    };
  }
}
```

## 🔒 Security Considerations

### Device Authentication

```typescript
// Device pairing with PIN
interface PairingRequest {
  deviceId: string;
  deviceMac: string;
  pin: string;
  userId: string;
}

// Backend validates PIN and registers device
async function pairDevice(request: PairingRequest): Promise<boolean> {
  // 1. Verify PIN (sent via device display or packaging)
  // 2. Check if device already paired
  // 3. Create device record in database
  // 4. Generate device token for MQTT authentication
  // 5. Return success/failure
}
```

### Data Encryption

- **BLE**: Use pairing with PIN/passkey
- **MQTT**: TLS encryption (mqtts://)
- **API**: HTTPS only
- **Storage**: Encrypt sensitive data in AsyncStorage

---

**Next**: See `06-AI-MODEL-SPECS.md` for AI/ML implementation details.
