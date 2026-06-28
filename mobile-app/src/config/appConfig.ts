/**
 * BabyGrow 2026 - FINAL PRODUCTION CONFIGURATION
 * All Features Activated - Ready for Expo Go Testing
 */

export const APP_CONFIG = {
  // App Info
  name: 'BabyGrow',
  version: '2.0.0',
  buildNumber: '2026.01',
  
  // Developer Info
  developer: {
    name: 'Jemi Altio',
    department: 'Sistem Komputer',
    university: 'Universitas Indo Global Mandiri',
    year: '2026'
  },
  
  // Theme Configuration
  theme: {
    defaultMode: 'dark', // Dark Mode (Midnight Pink) as default
    colorScheme: 'midnight-pink',
    enableDynamicTheme: true
  },
  
  // Feature Flags
  features: {
    livemeasurement: true, // LiveMeasurementModal activated
    childhoodGallery: true, // 5-Photo Gallery activated
    aiMBGQuestionnaire: true, // AI Gemini MBG activated
    growthCharts: true, // Interactive charts activated
    mqttRealtime: true, // MQTT real-time updates
    bleDevices: true, // BLE device pairing
    darkModeDefault: true // Dark mode as default
  },
  
  // Initial Values (NO DEMO DATA)
  initialValues: {
    weight: 0,
    height: 0,
    headCircumference: 0,
    displayPlaceholder: '--'
  },
  
  // MQTT Configuration
  mqtt: {
    updateOnlyWhenActive: true, // Only update UI when "Ukur Otomatis" is active
    autoDisconnectTimeout: 30000 // 30 seconds
  },
  
  // Gallery Configuration
  gallery: {
    maxPhotos: 5,
    storageKey: 'childhood_gallery',
    imageQuality: 0.8
  },
  
  // AI Configuration
  ai: {
    geminiModel: 'gemini-1.5-flash',
    language: 'Indonesian',
    responseFormat: 'markdown'
  },
  
  // Performance
  performance: {
    targetFPS: 60,
    enableHardwareAcceleration: true,
    optimizeAnimations: true
  }
};

export default APP_CONFIG;
