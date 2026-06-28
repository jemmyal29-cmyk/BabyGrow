# BabyGrow - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│                                                                  │
│  ┌────────────────────┐          ┌──────────────────────┐      │
│  │  React Native App  │          │   IoT Devices        │      │
│  │   (Android)        │◄────BLE──┤  - Smart Scale       │      │
│  │                    │          │  - Height Meter      │      │
│  └──────────┬─────────┘          └──────────┬───────────┘      │
│             │                               │                   │
└─────────────┼───────────────────────────────┼───────────────────┘
              │ HTTPS/WSS                     │ MQTT/TLS
              │                               │
┌─────────────┼───────────────────────────────┼───────────────────┐
│             │        API GATEWAY            │                   │
│             │    (Kong / AWS API GW)        │                   │
│             │    - Rate Limiting            │                   │
│             │    - Authentication           │                   │
│             │    - Load Balancing           │                   │
└─────────────┼───────────────────────────────┼───────────────────┘
              │                               │
┌─────────────┴───────────────────────────────┴───────────────────┐
│                      APPLICATION LAYER                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              NestJS Backend (Node.js)                   │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │   │
│  │  │ Auth Service │  │ Child Service │  │ Growth       │ │   │
│  │  │              │  │               │  │ Service      │ │   │
│  │  └──────────────┘  └───────────────┘  └──────────────┘ │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │   │
│  │  │ IoT Service  │  │ Notification  │  │ MBG Service  │ │   │
│  │  │              │  │ Service       │  │              │ │   │
│  │  └──────────────┘  └───────────────┘  └──────────────┘ │   │
│  └────────────┬────────────────────────────────┬──────────┘   │
│               │                                │               │
│  ┌────────────┴────────────────────────────────┴──────────┐   │
│  │         Python FastAPI (AI/ML Service)                 │   │
│  │  ┌──────────────────┐  ┌─────────────────────────┐    │   │
│  │  │ Stunting         │  │ Recommendation          │    │   │
│  │  │ Detection Model  │  │ Engine                  │    │   │
│  │  └──────────────────┘  └─────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────┬───────────────────────────────┬───────────────────┘
               │                               │
┌──────────────┴───────────────────────────────┴───────────────────┐
│                        DATA LAYER                                 │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL     │  │    Redis     │  │  AWS S3 / GCS    │  │
│  │  (TimescaleDB)   │  │   (Cache)    │  │  (File Storage)  │  │
│  │                  │  │              │  │                  │  │
│  │ - Users          │  │ - Sessions   │  │ - Profile pics   │  │
│  │ - Children       │  │ - Temp data  │  │ - Documents      │  │
│  │ - Measurements   │  │ - API cache  │  │ - Recipe images  │  │
│  │ - Recipes        │  └──────────────┘  └──────────────────┘  │
│  │ - Notifications  │                                           │
│  └──────────────────┘                                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MQTT Broker (Eclipse Mosquitto)             │  │
│  │              - IoT Device Communication                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Firebase Cloud   │  │  SendGrid    │  │  Google OAuth    │  │
│  │  Messaging (FCM) │  │  (Email)     │  │                  │  │
│  └──────────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. IoT Data Flow (Real-time Measurement)

```
IoT Device (BLE) 
    │
    │ 1. Measurement taken
    │
    ▼
Mobile App (BLE Manager)
    │
    │ 2. Receive raw data
    │ 3. Initial validation
    │
    ▼
Mobile App (Data Processor)
    │
    │ 4. Format & validate
    │ 5. Show confirmation to user
    │
    ▼
Backend API (IoT Service)
    │
    │ 6. Store in PostgreSQL
    │ 7. Trigger AI analysis
    │
    ▼
AI Service (FastAPI)
    │
    │ 8. Run stunting detection
    │ 9. Calculate z-scores
    │ 10. Generate recommendations
    │
    ▼
Backend API (Notification Service)
    │
    │ 11. Store results
    │ 12. Send push notification if risk detected
    │
    ▼
Mobile App
    │
    │ 13. Update UI
    │ 14. Show results to user
```

### 2. MQTT-based IoT Flow (Wi-Fi Devices)

```
IoT Device (Wi-Fi)
    │
    │ 1. Publish to MQTT topic
    │    topic: babygrow/device/{device_id}/measurement
    │
    ▼
MQTT Broker (Mosquitto)
    │
    │ 2. Route message
    │
    ▼
Backend IoT Service (MQTT Subscriber)
    │
    │ 3. Subscribe to topics
    │ 4. Validate & process
    │ 5. Store in database
    │
    ▼
WebSocket
    │
    │ 6. Push to connected mobile app
    │
    ▼
Mobile App
    │
    │ 7. Display real-time update
```

### 3. AI Analysis Flow

```
User Input / IoT Data
    │
    ▼
Backend API
    │
    │ 1. Collect child data
    │    - Age, gender
    │    - Current measurements
    │    - Historical data (last 6 months)
    │
    ▼
AI Service (Preprocessing)
    │
    │ 2. Feature engineering
    │    - Calculate growth velocity
    │    - Z-score calculation (WHO standards)
    │    - Normalize features
    │
    ▼
AI Model (Inference)
    │
    │ 3. Stunting risk prediction
    │    - Multi-class classification
    │    - Confidence scores
    │
    ▼
Post-processing
    │
    │ 4. Generate insights
    │    - Risk factors
    │    - Recommendations
    │    - Action items
    │
    ▼
Backend API
    │
    │ 5. Store results
    │ 6. Trigger MBG recommendations
    │ 7. Send notifications
    │
    ▼
Mobile App
    │
    │ 8. Display results with visualizations
```

## 🗄️ Database Schema

### PostgreSQL Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture_url TEXT,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Children Table
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    birth_weight DECIMAL(5,2),
    birth_height DECIMAL(5,2),
    birth_head_circumference DECIMAL(5,2),
    profile_picture_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth Measurements (TimescaleDB Hypertable)
CREATE TABLE growth_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    measured_at TIMESTAMP NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    head_circumference_cm DECIMAL(5,2),
    measurement_source VARCHAR(50) NOT NULL CHECK (
        measurement_source IN ('manual', 'iot_ble', 'iot_wifi')
    ),
    device_id VARCHAR(255),
    validated BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('growth_measurements', 'measured_at');

-- Stunting Assessments
CREATE TABLE stunting_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES growth_measurements(id),
    assessed_at TIMESTAMP NOT NULL,
    age_months INTEGER NOT NULL,
    weight_for_age_zscore DECIMAL(5,2),
    height_for_age_zscore DECIMAL(5,2),
    weight_for_height_zscore DECIMAL(5,2),
    head_circumference_zscore DECIMAL(5,2),
    risk_level VARCHAR(50) NOT NULL CHECK (
        risk_level IN ('normal', 'at_risk', 'stunted', 'severely_stunted')
    ),
    confidence_score DECIMAL(5,4),
    contributing_factors JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IoT Devices
CREATE TABLE iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL CHECK (
        device_type IN ('scale', 'height_meter', 'combined')
    ),
    device_name VARCHAR(255) NOT NULL,
    device_mac_address VARCHAR(17) UNIQUE,
    connection_type VARCHAR(20) NOT NULL CHECK (
        connection_type IN ('ble', 'wifi', 'mqtt')
    ),
    is_active BOOLEAN DEFAULT TRUE,
    last_connected TIMESTAMP,
    firmware_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    age_group_min_months INTEGER NOT NULL,
    age_group_max_months INTEGER NOT NULL,
    category VARCHAR(100),
    preparation_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    ingredients JSONB NOT NULL,
    instructions JSONB NOT NULL,
    nutritional_info JSONB,
    image_url TEXT,
    is_mbg_eligible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (
        status IN ('active', 'completed', 'cancelled')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plan Items
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id),
    scheduled_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL CHECK (
        meal_type IN ('breakfast', 'morning_snack', 'lunch', 
                      'afternoon_snack', 'dinner')
    ),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    notes TEXT
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('measurement_reminder', 'meal_reminder', 
                 'risk_alert', 'general')
    ),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_measurements_child_id ON growth_measurements(child_id);
CREATE INDEX idx_measurements_measured_at ON growth_measurements(measured_at DESC);
CREATE INDEX idx_assessments_child_id ON stunting_assessments(child_id);
CREATE INDEX idx_assessments_risk_level ON stunting_assessments(risk_level);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX idx_recipes_age_group ON recipes(age_group_min_months, age_group_max_months);
```

## 🔌 API Architecture

### RESTful API Endpoints

```
Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/google
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

Users
GET    /api/v1/users/me
PUT    /api/v1/users/me
PUT    /api/v1/users/me/password
DELETE /api/v1/users/me

Children
GET    /api/v1/children
POST   /api/v1/children
GET    /api/v1/children/:id
PUT    /api/v1/children/:id
DELETE /api/v1/children/:id
POST   /api/v1/children/:id/photo

Growth Measurements
GET    /api/v1/children/:childId/measurements
POST   /api/v1/children/:childId/measurements
GET    /api/v1/children/:childId/measurements/:id
PUT    /api/v1/children/:childId/measurements/:id
DELETE /api/v1/children/:childId/measurements/:id
GET    /api/v1/children/:childId/measurements/charts
GET    /api/v1/children/:childId/measurements/export

Stunting Assessment
GET    /api/v1/children/:childId/assessments
POST   /api/v1/children/:childId/assessments/analyze
GET    /api/v1/children/:childId/assessments/:id
GET    /api/v1/children/:childId/assessments/latest

IoT Devices
GET    /api/v1/iot/devices
POST   /api/v1/iot/devices
GET    /api/v1/iot/devices/:id
PUT    /api/v1/iot/devices/:id
DELETE /api/v1/iot/devices/:id
POST   /api/v1/iot/devices/:id/pair
POST   /api/v1/iot/measurements (webhook for MQTT devices)

Recipes & Meal Plans
GET    /api/v1/recipes
GET    /api/v1/recipes/:id
GET    /api/v1/recipes/search
GET    /api/v1/children/:childId/meal-plans
POST   /api/v1/children/:childId/meal-plans
GET    /api/v1/children/:childId/meal-plans/:id
PUT    /api/v1/children/:childId/meal-plans/:id
DELETE /api/v1/children/:childId/meal-plans/:id
PUT    /api/v1/meal-plans/:id/items/:itemId/complete

Notifications
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id

AI Service (Internal)
POST   /api/v1/ai/stunting/predict
POST   /api/v1/ai/recommendations/generate
```

### WebSocket Events

```javascript
// Client -> Server
'iot:subscribe'      // Subscribe to IoT updates
'iot:unsubscribe'    // Unsubscribe

// Server -> Client
'iot:measurement'    // New measurement from device
'iot:connected'      // Device connected
'iot:disconnected'   // Device disconnected
'notification:new'   // New notification
'assessment:complete'// AI analysis complete
```

## 🚀 Deployment Architecture

### AWS Deployment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              CloudFront (CDN)                           │
│              - SSL/TLS Certificate                      │
│              - DDoS Protection                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      Application Load Balancer (ALB)                    │
│      - Health checks                                    │
│      - SSL termination                                  │
└──────┬──────────────────────────────────┬───────────────┘
       │                                  │
       │                                  │
┌──────▼───────────┐              ┌──────▼───────────────┐
│  ECS Fargate     │              │  ECS Fargate         │
│  (NestJS)        │              │  (FastAPI AI)        │
│  Auto-scaling    │              │  Auto-scaling        │
│  2-10 instances  │              │  1-5 instances       │
└──────┬───────────┘              └──────┬───────────────┘
       │                                  │
       └──────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
│ RDS          │ │ ElastiCache │ S3     │
│ PostgreSQL   │ │ (Redis)     │        │
│ Multi-AZ     │ └─────────────┘ └────────┘
└──────────────┘

┌──────────────────────────────────────────┐
│         AWS IoT Core                     │
│         - MQTT Broker                    │
│         - Device Registry                │
└──────────────────────────────────────────┘
```

### Container Architecture

```yaml
# docker-compose.yml (Development)
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: babygrow
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://admin:${DB_PASSWORD}@postgres:5432/babygrow
      - REDIS_URL=redis://redis:6379
      - MQTT_URL=mqtt://mosquitto:1883
    depends_on:
      - postgres
      - redis
      - mosquitto

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://admin:${DB_PASSWORD}@postgres:5432/babygrow
    depends_on:
      - postgres
```

## 🔒 Security Architecture

### Authentication Flow

```
1. User Login
   ├─> Client sends credentials
   ├─> Server validates
   ├─> Generate Access Token (15 min expiry)
   ├─> Generate Refresh Token (7 days expiry)
   ├─> Store Refresh Token in httpOnly cookie
   └─> Return Access Token to client

2. Authenticated Request
   ├─> Client sends Access Token in Authorization header
   ├─> Server validates JWT
   ├─> Check token expiry
   └─> Process request

3. Token Refresh
   ├─> Client detects expired Access Token
   ├─> Send Refresh Token
   ├─> Server validates Refresh Token
   ├─> Generate new Access Token
   └─> Return to client
```

### Data Encryption

- **In Transit**: TLS 1.3
- **At Rest**: 
  - Database: AWS RDS encryption
  - S3: Server-side encryption (SSE-S3)
  - Sensitive fields: AES-256 encryption
- **BLE Communication**: Pairing with passkey
- **MQTT**: TLS encryption

### Security Best Practices

- Input validation & sanitization
- Prepared statements (SQL injection prevention)
- Rate limiting (100 req/min per user)
- CORS configuration
- Security headers (Helmet.js)
- Regular security audits
- Dependency vulnerability scanning
- Secrets management (AWS Secrets Manager)

---

**Next**: See `02-TECH-STACK-DETAIL.md` for detailed technology specifications.
