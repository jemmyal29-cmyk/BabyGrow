/**
 * BabyGrow Data Models
 * TypeScript interfaces for all data structures
 */

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
  birthWeight?: number; // kg
  birthHeight?: number; // cm
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
  weight: number; // kg
  height: number; // cm
  headCircumference?: number; // cm
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

// ==================== Stunting Assessment Models ====================

export type StuntingRiskLevel = 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';

export interface StuntingAssessment {
  id: string;
  childId: string;
  measurementId: string;
  riskLevel: StuntingRiskLevel;
  confidence: number; // 0-1
  heightForAgeZScore: number;
  weightForAgeZScore: number;
  weightForHeightZScore: number;
  contributingFactors: string[];
  recommendations: string[];
  assessmentDate: string;
  aiModelVersion?: string;
  createdAt: string;
}

export interface AssessmentHistory {
  childId: string;
  assessments: StuntingAssessment[];
  trend: 'improving' | 'stable' | 'declining';
  lastAssessment: StuntingAssessment;
}

// ==================== Growth Chart Models ====================

export interface GrowthDataPoint {
  date: string;
  ageMonths: number;
  weight?: number;
  height?: number;
  headCircumference?: number;
  weightZScore?: number;
  heightZScore?: number;
}

export interface GrowthChartData {
  childId: string;
  dataPoints: GrowthDataPoint[];
  whoStandards: {
    median: number[];
    plusOneSD: number[];
    minusOneSD: number[];
    plusTwoSD: number[];
    minusTwoSD: number[];
    plusThreeSD: number[];
    minusThreeSD: number[];
  };
}

// ==================== Recipe & Nutrition Models ====================

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ageRange: string; // e.g., "6-12 months"
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  tags: string[];
  isMBGProgram: boolean; // Makan Bergizi Gratis
  createdAt: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number; // kcal
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  vitamins?: {
    [key: string]: number;
  };
  minerals?: {
    [key: string]: number;
  };
}

export interface MealPlan {
  id: string;
  childId: string;
  startDate: string;
  endDate: string;
  meals: PlannedMeal[];
  targetCalories: number;
  targetProtein: number;
  createdBy: string;
  createdAt: string;
}

export interface PlannedMeal {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipe?: Recipe;
  completed: boolean;
}

// ==================== IoT Device Models ====================

export interface IoTDevice {
  id: string;
  deviceId: string;
  name: string;
  type: 'scale' | 'height_meter' | 'combo';
  connectionType: 'ble' | 'mqtt';
  status: 'online' | 'offline' | 'paired';
  batteryLevel?: number; // 0-100
  firmwareVersion?: string;
  lastSeen?: string;
  pairedBy: string;
  pairedAt: string;
}

export interface BLEDevice {
  id: string;
  name: string;
  rssi: number; // signal strength
  serviceUUIDs: string[];
}

export interface DeviceMeasurement {
  deviceId: string;
  timestamp: string;
  weight?: number;
  height?: number;
  temperature?: number;
  batteryLevel?: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ==================== Notification Models ====================

export interface Notification {
  id: string;
  userId: string;
  type: 'measurement_reminder' | 'assessment_alert' | 'recipe_suggestion' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  measurementReminders: boolean;
  assessmentAlerts: boolean;
  recipeSuggestions: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
}

// ==================== Auth Models ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'parent' | 'kader';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==================== API Response Models ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Form Models ====================

export interface ChildFormData {
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  birthWeight?: number;
  birthHeight?: number;
  bloodType?: string;
  allergies?: string;
  notes?: string;
}

export interface MeasurementFormData {
  weight: number;
  height: number;
  headCircumference?: number;
  measurementDate: string;
  notes?: string;
}

export interface ProfileFormData {
  name: string;
  phone?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

// ==================== Statistics Models ====================

export interface DashboardStats {
  totalChildren: number;
  atRiskChildren: number;
  stuntedChildren: number;
  recentMeasurements: number;
  upcomingReminders: number;
}

export interface ChildStats {
  childId: string;
  totalMeasurements: number;
  growthTrend: 'improving' | 'stable' | 'declining';
  lastMeasurementDate: string;
  currentRiskLevel: StuntingRiskLevel;
  averageGrowthVelocity: number; // cm/month
}
