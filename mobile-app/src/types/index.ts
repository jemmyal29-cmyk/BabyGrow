/**
 * BabyGrow - Centralized Type Definitions
 * UIGM 2026 Standard
 * Prevents circular dependencies and "Require cycle" warnings
 */

// ==================== MQTT & IoT Types ====================

export interface MQTTMeasurement {
  weight_kg: number;
  height_cm: number;
  timestamp: string;
  deviceId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
}

export interface MQTTConnectionStatus {
  connected: boolean;
  broker: string;
  lastSeen?: string;
  error?: string;
}

export interface ESP32Config {
  deviceId: string;
  deviceName: string;
  macAddress?: string;
  mqttTopic: string;
  connectionType: 'mqtt' | 'ble';
}

export type PairingStatus = 'IDLE' | 'SCANNING' | 'CONNECTING' | 'SUCCESS' | 'FAILED';

// ==================== BLE Types ====================

export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  serviceUUIDs?: string[];
}

export interface BLEMeasurement {
  height_cm: number;
  weight_kg: number;
  timestamp: string;
  deviceId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
  signalStrength?: number;
}

export interface DeviceInfo {
  name: string;
  deviceId: string;
  type: string;
  batteryLevel: number;
  signalStrength: number;
  status: 'connected' | 'disconnected';
}

// ==================== User Models ====================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'parent' | 'kader' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  notificationEnabled: boolean;
  language: 'id' | 'en';
}

// ==================== Child Models ====================

export interface Child {
  id: string;
  userId: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  birthWeight?: number;
  birthHeight?: number;
  photo?: string;
  bloodType?: string;
  allergies?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildWithMeasurements extends Child {
  latestMeasurement?: Measurement;
  latestAssessment?: StuntingAssessment;
  measurementCount: number;
}

// ==================== Measurement Models ====================

export interface Measurement {
  id: string;
  childId: string;
  weight: number;
  height: number;
  headCircumference?: number;
  measurementDate: string;
  ageMonths: number;
  source: 'manual' | 'iot_ble' | 'iot_mqtt';
  deviceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MeasurementWithZScores extends Measurement {
  weightForAge: ZScore;
  heightForAge: ZScore;
  weightForHeight: ZScore;
  bmi: number;
  bmiForAge?: ZScore;
}

export interface ZScore {
  value: number;
  zscore: number;
  percentile: number;
  category: 'severely_low' | 'low' | 'normal' | 'high' | 'severely_high';
}

// ==================== Stunting Assessment ====================

export type StuntingRiskLevel = 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';

export interface StuntingAssessment {
  id: string;
  childId: string;
  measurementId: string;
  riskLevel: StuntingRiskLevel;
  confidence: number;
  heightForAgeZScore: number;
  weightForAgeZScore: number;
  weightForHeightZScore: number;
  contributingFactors: string[];
  recommendations: string[];
  assessmentDate: string;
  aiModelVersion?: string;
  createdAt: string;
}

// ==================== MBG (Makanan Bergizi Gratis) ====================

export interface MBGQuestionnaire {
  favoriteFoods: string;
  mealSchedule: string;
  allergies: string;
}

export interface MBGMenuPlan {
  id: string;
  childId: string;
  date: string;
  breakfast: MBGMeal;
  morningSnack: MBGMeal;
  lunch: MBGMeal;
  afternoonSnack: MBGMeal;
  dinner: MBGMeal;
  totalCalories: number;
  totalProtein: number;
  generatedBy: 'gemini' | 'manual';
}

export interface MBGMeal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  cookingTime: number;
  instructions: string[];
}

// ==================== Childhood Gallery (Premium Feature) ====================

export interface ChildhoodPhoto {
  id: string;
  uri: string;
  caption?: string;
  dateAdded: string;
  slot: 1 | 2 | 3 | 4 | 5;
}

export interface ChildhoodGallery {
  userId: string;
  photos: (ChildhoodPhoto | null)[];
}

// ==================== Navigation Types ====================

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  Children: undefined;
  Growth: undefined;
  ManualMeasurement: undefined;
  Measurement: undefined;
  AIAssistant: undefined;
  RecipeList: undefined;
  IoTDevice: undefined;
};

// ==================== Theme Types ====================

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
}
