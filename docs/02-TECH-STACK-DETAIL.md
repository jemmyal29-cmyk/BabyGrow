  # BabyGrow - Detailed Tech Stack Specifications

## 📱 Mobile Application (React Native)

### Core Dependencies

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.5",
    "typescript": "~5.9.2",
    
    // Navigation
    "@react-navigation/native": "^7.1.26",
    "@react-navigation/bottom-tabs": "^7.9.0",
    "@react-navigation/stack": "^6.3.20",
    "react-native-screens": "^4.19.0",
    "react-native-safe-area-context": "^5.6.2",
    
    // State Management
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",
    
    // API & Networking
    "@reduxjs/toolkit/query": "^2.0.1",
    "axios": "^1.6.5",
    "socket.io-client": "^4.6.1",
    
    // UI Components & Styling
    "react-native-paper": "^5.11.6",
    "react-native-vector-icons": "^10.0.3",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-svg": "^14.1.0",
    
    // Forms & Validation
    "react-hook-form": "^7.49.3",
    "yup": "^1.3.3",
    "@hookform/resolvers": "^3.3.4",
    
    // Charts & Graphs
    "react-native-chart-kit": "^6.12.0",
    "victory-native": "^36.9.1",
    
    // Date & Time
    "date-fns": "^3.0.6",
    "react-native-date-picker": "^4.4.0",
    
    // IoT Communication
    "react-native-ble-manager": "^11.4.0",
    "react-native-permissions": "^4.0.3",
    "mqtt": "^5.3.4",
    
    // Push Notifications
    "@react-native-firebase/app": "^19.0.1",
    "@react-native-firebase/messaging": "^19.0.1",
    "@notifee/react-native": "^7.8.2",
    
    // Storage
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-encrypted-storage": "^4.0.3",
    
    // Image Handling
    "react-native-image-picker": "^7.1.0",
    "react-native-fast-image": "^8.6.3",
    
    // Authentication
    "@react-native-google-signin/google-signin": "^11.0.0",
    "react-native-biometrics": "^3.0.1",
    
    // Utilities
    "lodash": "^4.17.21",
    "react-native-device-info": "^10.12.0",
    "react-native-haptic-feedback": "^2.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.1.10",
    "babel-preset-expo": "~54.0.0",
    "typescript": "~5.9.2",
    "@typescript-eslint/eslint-plugin": "^6.18.1",
    "@typescript-eslint/parser": "^6.18.1",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.3"
  }
}
```

### Folder Structure

```
mobile-app/
├── src/
│   ├── api/                    # API configuration & endpoints
│   │   ├── config.ts
│   │   ├── interceptors.ts
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── children.ts
│   │       ├── measurements.ts
│   │       └── recipes.ts
│   ├── assets/                 # Images, fonts, icons
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/             # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── charts/
│   │   │   ├── GrowthChart.tsx
│   │   │   └── ZScoreChart.tsx
│   │   └── iot/
│   │       ├── DeviceScanner.tsx
│   │       └── MeasurementReader.tsx
│   ├── navigation/             # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/                # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── children/
│   │   │   ├── ChildrenListScreen.tsx
│   │   │   ├── AddChildScreen.tsx
│   │   │   ├── ChildDetailScreen.tsx
│   │   │   └── GrowthHistoryScreen.tsx
│   │   ├── measurement/
│   │   │   ├── ManualInputScreen.tsx
│   │   │   └── IoTMeasurementScreen.tsx
│   │   ├── stunting/
│   │   │   ├── AssessmentScreen.tsx
│   │   │   └── ResultScreen.tsx
│   │   ├── meals/
│   │   │   ├── RecipeListScreen.tsx
│   │   │   ├── RecipeDetailScreen.tsx
│   │   │   └── MealPlanScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   ├── store/                  # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── childrenSlice.ts
│   │   │   └── measurementsSlice.ts
│   │   └── api/
│   │       └── babyGrowApi.ts  # RTK Query
│   ├── services/               # Business logic services
│   │   ├── AuthService.ts
│   │   ├── BLEService.ts
│   │   ├── MQTTService.ts
│   │   └── NotificationService.ts
│   ├── utils/                  # Utility functions
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── zScoreCalculator.ts
│   │   └── constants.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBLE.ts
│   │   └── useNotifications.ts
│   ├── theme/                  # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── types/                  # TypeScript types
│   │   ├── models.ts
│   │   ├── api.ts
│   │   └── navigation.ts
│   └── App.tsx
├── android/
├── ios/
├── package.json
├── tsconfig.json
└── babel.config.js
```

### Theme Configuration (Halodoc-inspired)

```typescript
// src/theme/colors.ts
export const colors = {
  primary: {
    main: '#FF69B4',      // Hot Pink
    light: '#FFB6C1',     // Light Pink
    dark: '#C71585',      // Medium Violet Red
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#FFA07A',      // Light Salmon (accent)
    light: '#FFD4B8',
    dark: '#FF7F50',
  },
  neutral: {
    white: '#FFFFFF',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
  stunting: {
    normal: '#4CAF50',
    atRisk: '#FFC107',
    stunted: '#FF9800',
    severelyStunted: '#F44336',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    disabled: '#F5F5F5',
  },
};

// src/theme/typography.ts
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// src/theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## 🔧 Backend (NestJS)

### Core Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    
    // Database
    "@nestjs/typeorm": "^10.0.1",
    "typeorm": "^0.3.19",
    "pg": "^8.11.3",
    
    // Cache
    "@nestjs/cache-manager": "^2.2.0",
    "cache-manager": "^5.4.0",
    "cache-manager-redis-yet": "^4.1.2",
    "redis": "^4.6.12",
    
    // Authentication & Security
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "bcrypt": "^5.1.1",
    "@nestjs/throttler": "^5.1.1",
    "helmet": "^7.1.0",
    
    // Validation
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    
    // Configuration
    "@nestjs/config": "^3.1.1",
    "joi": "^17.12.0",
    
    // File Upload
    "@nestjs/platform-multer": "^10.3.0",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "@aws-sdk/client-s3": "^3.490.0",
    
    // MQTT
    "mqtt": "^5.3.4",
    "async-mqtt": "^2.6.3",
    
    // Email
    "@nestjs-modules/mailer": "^1.10.3",
    "nodemailer": "^6.9.8",
    
    // Push Notifications
    "firebase-admin": "^12.0.0",
    
    // Queue
    "@nestjs/bull": "^10.0.1",
    "bull": "^4.12.0",
    
    // Logging & Monitoring
    "@nestjs/axios": "^3.0.1",
    "winston": "^3.11.0",
    "nest-winston": "^1.9.4",
    
    // Utilities
    "date-fns": "^3.0.6",
    "uuid": "^9.0.1",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/node": "^20.11.5",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/passport-jwt": "^4.0.0",
    "@typescript-eslint/eslint-plugin": "^6.18.1",
    "@typescript-eslint/parser": "^6.18.1",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

### Folder Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                 # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── mqtt.config.ts
│   │   └── aws.config.ts
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── constants/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   ├── children/
│   │   │   ├── children.module.ts
│   │   │   ├── children.controller.ts
│   │   │   ├── children.service.ts
│   │   │   ├── entities/
│   │   │   │   └── child.entity.ts
│   │   │   └── dto/
│   │   ├── measurements/
│   │   │   ├── measurements.module.ts
│   │   │   ├── measurements.controller.ts
│   │   │   ├── measurements.service.ts
│   │   │   ├── entities/
│   │   │   │   └── measurement.entity.ts
│   │   │   └── dto/
│   │   ├── stunting/
│   │   │   ├── stunting.module.ts
│   │   │   ├── stunting.controller.ts
│   │   │   ├── stunting.service.ts
│   │   │   ├── entities/
│   │   │   │   └── assessment.entity.ts
│   │   │   └── dto/
│   │   ├── iot/
│   │   │   ├── iot.module.ts
│   │   │   ├── iot.gateway.ts
│   │   │   ├── iot.service.ts
│   │   │   ├── mqtt.service.ts
│   │   │   └── entities/
│   │   │       └── device.entity.ts
│   │   ├── recipes/
│   │   │   ├── recipes.module.ts
│   │   │   ├── recipes.controller.ts
│   │   │   ├── recipes.service.ts
│   │   │   ├── entities/
│   │   │   │   └── recipe.entity.ts
│   │   │   └── dto/
│   │   ├── meal-plans/
│   │   │   ├── meal-plans.module.ts
│   │   │   ├── meal-plans.controller.ts
│   │   │   ├── meal-plans.service.ts
│   │   │   └── entities/
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── fcm.service.ts
│   │   │   └── entities/
│   │   └── ai-integration/
│   │       ├── ai-integration.module.ts
│   │       └── ai-integration.service.ts
│   └── database/
│       ├── migrations/
│       └── seeds/
├── test/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

### Environment Variables

```bash
# .env.example

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=babygrow
DATABASE_SSL=false

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=babygrow-backend

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=babygrow-uploads

# Firebase
FIREBASE_PROJECT_ID=babygrow-app
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@babygrow-app.iam.gserviceaccount.com

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@babygrow.app

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN=http://localhost:3000,babygrow://
```

## 🤖 AI/ML Service (Python FastAPI)

### Dependencies

```python
# requirements.txt

# FastAPI & Server
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# ML & Data Science
tensorflow==2.15.0
# OR
torch==2.1.2
torchvision==0.16.2

scikit-learn==1.4.0
pandas==2.1.4
numpy==1.26.3
scipy==1.11.4

# WHO Growth Standards
pygrowup==0.8.0  # WHO Child Growth Standards

# API & Utilities
httpx==0.26.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Monitoring & Logging
python-json-logger==2.0.7
prometheus-client==0.19.0

# Testing
pytest==7.4.4
pytest-asyncio==0.23.3
```

### Folder Structure

```
ai-service/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── endpoints/
│   │   │   ├── stunting.py
│   │   │   └── recommendations.py
│   │   └── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── ml_models/
│   │   │   ├── stunting_classifier.py
│   │   │   ├── growth_predictor.py
│   │   │   └── recommendation_engine.py
│   │   └── schemas/
│   │       ├── stunting.py
│   │       └── recommendations.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── stunting_service.py
│   │   ├── who_standards.py
│   │   └── recommendation_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── preprocessing.py
│   │   ├── feature_engineering.py
│   │   └── validators.py
│   └── db/
│       ├── __init__.py
│       └── database.py
├── models/                     # Saved ML models
│   ├── stunting_model.h5
│   └── scaler.pkl
├── data/                       # Training data & WHO standards
│   ├── who_standards/
│   └── training/
├── notebooks/                  # Jupyter notebooks for research
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

### AI Model Architecture

```python
# app/models/ml_models/stunting_classifier.py

import tensorflow as tf
from tensorflow import keras
from typing import Dict, List
import numpy as np

class StuntingClassifier:
    """
    Neural Network for Stunting Risk Classification
    
    Input Features:
    - age_months: Age in months (0-60)
    - gender: Male=0, Female=1
    - weight_kg: Current weight
    - height_cm: Current height
    - weight_for_age_zscore: Z-score based on WHO standards
    - height_for_age_zscore: Z-score based on WHO standards
    - weight_for_height_zscore: Z-score based on WHO standards
    - growth_velocity: Change in height over last 3 months
    - weight_velocity: Change in weight over last 3 months
    
    Output:
    - risk_level: [normal, at_risk, stunted, severely_stunted]
    - confidence: Probability score
    """
    
    def __init__(self, model_path: str = 'models/stunting_model.h5'):
        self.model = self.load_model(model_path)
        self.classes = ['normal', 'at_risk', 'stunted', 'severely_stunted']
    
    def build_model(self) -> keras.Model:
        """Build neural network architecture"""
        model = keras.Sequential([
            keras.layers.Input(shape=(9,)),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(4, activation='softmax')  # 4 classes
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', 'AUC']
        )
        
        return model
    
    def predict(self, features: np.ndarray) -> Dict:
        """
        Make prediction
        
        Returns:
            {
                'risk_level': str,
                'confidence': float,
                'probabilities': dict,
                'contributing_factors': list
            }
        """
        predictions = self.model.predict(features)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        return {
            'risk_level': self.classes[class_idx],
            'confidence': confidence,
            'probabilities': {
                class_name: float(prob)
                for class_name, prob in zip(self.classes, predictions[0])
            },
            'contributing_factors': self._analyze_factors(features[0])
        }
    
    def _analyze_factors(self, features: np.ndarray) -> List[str]:
        """Analyze which factors contribute to risk"""
        factors = []
        
        # Feature indices
        height_zscore_idx = 5
        weight_zscore_idx = 4
        growth_velocity_idx = 7
        
        if features[height_zscore_idx] < -2:
            factors.append('Height significantly below WHO standard')
        if features[weight_zscore_idx] < -2:
            factors.append('Weight significantly below WHO standard')
        if features[growth_velocity_idx] < 0.5:
            factors.append('Low growth velocity')
            
        return factors
```

### WHO Standards Integration

```python
# app/services/who_standards.py

from pygrowup import Calculator
import pandas as pd

class WHOStandards:
    """
    WHO Child Growth Standards Calculator
    Uses pygrowup library for z-score calculations
    """
    
    def __init__(self):
        self.calculator = Calculator()
    
    def calculate_zscores(
        self,
        age_months: float,
        gender: str,
        weight_kg: float,
        height_cm: float
    ) -> Dict[str, float]:
        """
        Calculate all WHO z-scores
        
        Args:
            age_months: Age in months
            gender: 'M' or 'F'
            weight_kg: Weight in kilograms
            height_cm: Height in centimeters
            
        Returns:
            {
                'wfa': weight-for-age z-score,
                'hfa': height-for-age z-score,
                'wfh': weight-for-height z-score,
                'bmi': BMI z-score
            }
        """
        
        # Convert gender
        sex = 'M' if gender.upper() in ['M', 'MALE'] else 'F'
        
        # Calculate z-scores
        wfa = self.calculator.wfa(weight_kg, age_months, sex)
        hfa = self.calculator.lhfa(height_cm, age_months, sex)
        wfh = self.calculator.wfl(weight_kg, height_cm, sex)
        
        return {
            'weight_for_age_zscore': round(wfa, 2),
            'height_for_age_zscore': round(hfa, 2),
            'weight_for_height_zscore': round(wfh, 2),
            'stunting_indicator': self._classify_hfa(hfa)
        }
    
    def _classify_hfa(self, hfa_zscore: float) -> str:
        """
        Classify stunting based on height-for-age z-score
        WHO Definition:
        - Normal: >= -2 SD
        - Stunted: < -2 SD
        - Severely Stunted: < -3 SD
        """
        if hfa_zscore >= -2:
            return 'normal'
        elif hfa_zscore >= -3:
            return 'stunted'
        else:
            return 'severely_stunted'
```

## 🔌 IoT Integration Details

### BLE Communication Protocol

```typescript
// mobile-app/src/services/BLEService.ts

import BleManager from 'react-native-ble-manager';

export class BLEService {
  // BLE Service UUID (custom for BabyGrow devices)
  private readonly SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
  
  // Characteristics
  private readonly WEIGHT_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
  private readonly HEIGHT_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
  private readonly BATTERY_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';
  
  async scanForDevices(timeout: number = 10000): Promise<Device[]> {
    await BleManager.scan([], timeout, true);
    // Returns devices with name starting with "BabyGrow-"
  }
  
  async connectToDevice(deviceId: string): Promise<void> {
    await BleManager.connect(deviceId);
    await BleManager.retrieveServices(deviceId);
  }
  
  async readMeasurement(deviceId: string): Promise<Measurement> {
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
    
    return {
      weight_kg: this.parseWeight(weightData),
      height_cm: this.parseHeight(heightData),
      timestamp: new Date().toISOString()
    };
  }
  
  private parseWeight(data: number[]): number {
    // Convert byte array to float (little-endian)
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    data.forEach((byte, index) => view.setUint8(index, byte));
    return view.getFloat32(0, true);
  }
}
```

### MQTT Message Format

```json
{
  "protocol": "MQTT",
  "topics": {
    "measurement": "babygrow/device/{device_id}/measurement",
    "status": "babygrow/device/{device_id}/status",
    "command": "babygrow/device/{device_id}/command"
  },
  "message_format": {
    "measurement": {
      "device_id": "BG-SCALE-001",
      "timestamp": "2025-12-23T10:30:00Z",
      "type": "measurement",
      "data": {
        "weight_kg": 12.5,
        "height_cm": 85.3,
        "battery_level": 87,
        "temperature": 23.5
      },
      "metadata": {
        "firmware_version": "1.2.3",
        "measurement_quality": "good"
      }
    },
    "status": {
      "device_id": "BG-SCALE-001",
      "timestamp": "2025-12-23T10:30:00Z",
      "type": "status",
      "status": "online",
      "battery_level": 87,
      "signal_strength": -45
    }
  }
}
```

---

**Next**: See `03-USER-FLOW.md` for detailed user journeys and `04-UI-MOCKUPS.md` for wireframes.
