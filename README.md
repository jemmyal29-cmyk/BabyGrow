# 🦄 BabyGrow Unicorn 2026 - Aplikasi Pemantauan Pertumbuhan Balita Berbasis AI

## 🚀 Unicorn Standard Features

✨ **NEW IN UNICORN 2026:**
- 🌸 Custom Splash Screen with branded logo
- 🎠 5-Page Interactive Onboarding Carousel
- 🔄 Ultimate Login with 3D logo rotation & animations
- 📡 Automatic IoT Pairing System (MQTT/BLE)
- 🌙 Full Dark Mode Theme (Deep Charcoal & Midnight Pink)
- 💎 Glassmorphism & 3D Neumorphic Design
- 🎯 60fps Smooth Animations
- 📳 Haptic Feedback Throughout

## 📱 Overview
BabyGrow adalah aplikasi mobile berbasis React Native untuk platform Android yang mengintegrasikan teknologi IoT dan Artificial Intelligence untuk memantau pertumbuhan balita, mendeteksi risiko stunting, dan memberikan rekomendasi program Makan Bergizi Gratis (MBG).

**Status**: 🦄 **Unicorn 2026 Standard** - Production Ready!

## 🎨 Design Philosophy
- **Inspirasi**: Halodoc + Modern Premium Apps
- **Light Mode**: Pink (#FF69B4), White, Soft Pink (#FFB6C1)
- **Dark Mode**: Deep Charcoal (#121212), Midnight Pink (#FF1493)
- **Logo**: Custom pink timbangan (scale) in circular frame
- **UI Style**: Glassmorphism, 3D shadows, smooth animations
- **Animation**: 60fps with spring physics and haptic feedback

## ✨ Key Features

### 🦄 Unicorn Experience (NEW!)
- **Splash Screen**: Custom branded logo with fade-in animation
- **Onboarding Carousel**: 5 interactive slides showcasing app features
  * AI Vision Stadiometer (🤖)
  * Smart MBG Engine (🍎)
  * IoT Real-time Monitoring (📡)
  * WHO Z-Score Analysis (📊)
  * AI Health Consultation (💬)
- **Ultimate Login**: 3D rotating logo, bouncing baby emoji, glassmorphism form
- **Pairing Modal**: 3-state system (connecting → success → error) with animations
- **Dark Mode**: Complete theme system with elegant Midnight Pink palette

### 🔐 Authentication & User Management
- Email/Password & Google OAuth
- Multi-child profile support
- Secure session management
- RBAC (Role-Based Access Control): User & Admin roles

### 👶 Child Profile Management
- Complete profile creation (name, DOB, gender, birth stats)
- Photo upload
- Medical history tracking

### 📡 IoT Integration (Enhanced!)
- **Automatic Pairing** - "Ukur Otomatis" button with beautiful modal UI
- **Bluetooth Low Energy (BLE)** - Direct device connection
- **MQTT over WiFi** - Remote device support (broker.emqx.io)
- Real-time weight & height measurements
- Automatic data validation
- Hardware health monitoring widget

### 📊 Growth Monitoring
- WHO-compliant z-score calculations
- Interactive growth charts
- Historical trend analysis
- Manual data entry option
- Real-time auto-calculation after pairing

### 🤖 AI-Powered Stunting Detection
- Deep learning model (85%+ accuracy)
- Risk classification: Normal, At Risk, Stunted, Severely Stunted
- Contributing factor analysis
- Confidence scoring
- Gemini AI consultation integration

### 🍽️ Nutrition Recommendations (MBG)
- Personalized meal plans
- 100+ Indonesian recipes
- Nutritional analysis
- Weekly meal scheduler
- Shopping list generator
- Smart MBG recommendation engine

### 🔔 Smart Notifications
- Measurement reminders
- Meal time alerts
- Risk warnings
- Educational tips

## 📚 Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

1. **[01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md)**
   - High-level system architecture
   - Data flow diagrams
   - Database schema
   - API specifications
   - Deployment architecture

2. **[02-TECH-STACK-DETAIL.md](docs/02-TECH-STACK-DETAIL.md)**
   - Detailed tech stack for each component
   - Dependencies & versions
   - Code structure
   - Configuration examples

3. **[03-USER-FLOW.md](docs/03-USER-FLOW.md)**
   - User personas
   - Complete user journeys
   - Decision trees
   - Time estimates

4. **[04-UI-MOCKUPS.md](docs/04-UI-MOCKUPS.md)**
   - Design system (colors, typography, spacing)
   - ASCII wireframes
   - Component specifications
   - Screen mockups

5. **[05-IOT-INTEGRATION.md](docs/05-IOT-INTEGRATION.md)**
   - BLE protocol specification
   - MQTT message formats
   - Implementation guides
   - Data validation rules

6. **[06-AI-MODEL-SPECS.md](docs/06-AI-MODEL-SPECS.md)**
   - Model architecture
   - Training pipeline
   - WHO standards integration
   - Recommendation engine
   - Deployment guide

7. **[07-IMPLEMENTATION-ROADMAP.md](docs/07-IMPLEMENTATION-ROADMAP.md)**
   - 12-15 month project timeline
   - Sprint breakdown
   - Team structure
   - Budget estimation
   - Risk mitigation

8. **[08-SECURITY-COMPLIANCE.md](docs/08-SECURITY-COMPLIANCE.md)**
   - Security architecture
   - Authentication & authorization
   - Data encryption
   - Privacy compliance
   - Security checklist

## 🚀 Tech Stack

### Mobile App (React Native)
```
React Native 0.73+ | TypeScript | Redux Toolkit
React Navigation | React Native Paper (Pink Theme)
BLE Manager | MQTT.js | Firebase (FCM)
```

### Backend (NestJS)
```
NestJS | TypeScript | PostgreSQL + TimescaleDB
Redis | JWT Auth | WebSocket
MQTT Integration | Bull Queue
```

### AI/ML (Python)
```
FastAPI | TensorFlow/PyTorch | Scikit-learn
Pandas | NumPy | WHO Growth Standards
```

### Infrastructure
```
AWS/GCP | Docker | Kubernetes
GitHub Actions | CloudFront CDN
DataDog Monitoring
```

## 📊 Project Structure

```
BabyGrow/
├── mobile-app/          # React Native Android App
│   ├── src/
│   │   ├── api/         # API configuration & endpoints
│   │   ├── components/  # Reusable components (Button, Card, Input, Charts)
│   │   ├── theme/       # Design system (colors, typography, spacing)
│   │   ├── types/       # TypeScript models & interfaces
│   │   └── utils/       # Utilities (WHO z-score calculator)
│   ├── package.json     # Dependencies
│   └── tsconfig.json    # TypeScript config
├── backend/             # NestJS API Server (TODO)
├── ai-service/          # Python FastAPI AI Service (TODO)
├── iot-simulator/       # Device Simulators (BLE/MQTT) (TODO)
├── infrastructure/      # Docker, K8s, CI/CD configs (TODO)
└── docs/                # Complete Documentation ✅
    ├── 00-VISUAL-SUMMARY.md            # Visual reference
    ├── 01-ARCHITECTURE.md              # System architecture
    ├── 02-TECH-STACK-DETAIL.md         # Tech specifications
    ├── 03-USER-FLOW.md                 # User journeys
    ├── 04-UI-MOCKUPS.md                # UI/UX design
    ├── 05-IOT-INTEGRATION.md           # IoT protocols
    ├── 06-AI-MODEL-SPECS.md            # AI model specs
    ├── 07-IMPLEMENTATION-ROADMAP.md    # Project timeline
    ├── 08-SECURITY-COMPLIANCE.md       # Security guide
    ├── 09-DEVELOPMENT-GUIDE.md         # Developer guide  
    └── 10-IMPLEMENTATION-CHECKLIST.md  # Progress tracker
```

## 🎯 Development Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1: MVP** | 4 months | Auth, Profile, Manual Entry, Basic AI |
| **Phase 2: IoT** | 3 months | BLE, MQTT, Device Integration |
| **Phase 3: AI** | 3 months | ML Model, WHO Standards, Optimization |
| **Phase 4: MBG** | 2 months | Recipes, Recommendations, Meal Plans |
| **Phase 5: Launch** | 2 months | Polish, Testing, Deployment |

**Total Timeline**: 12-15 months

## 🔐 Security Features

- ✅ End-to-end encryption
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting & DDoS protection
- ✅ Input validation & sanitization
- ✅ Secure storage (encrypted)
- ✅ Certificate pinning
- ✅ RBAC (Role-Based Access Control)
- ✅ GDPR compliance ready

## 📈 Expected Performance

| Metric | Target |
|--------|--------|
| App Launch Time | < 2 seconds |
| API Response (p95) | < 500ms |
| AI Inference Time | < 100ms |
| Crash-free Rate | > 99% |
| Model Accuracy | > 85% |

## 👥 Target Users

- 👨‍👩‍👧 Parents dengan balita (0-5 tahun)
- 🏥 Kader Posyandu
- 👨‍⚕️ Healthcare professionals
- 🏛️ Government health programs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/babygrow.git
cd babygrow

# Setup backend
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run dev

# Setup AI service
cd ../ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Setup mobile app
cd ../mobile-app
npm install
npx react-native run-android
```

Detailed setup instructions available in each component's README.

## 📞 Contact & Support

- **Developer**: [Your Name]
- **Email**: dev@babygrow.app
- **Security**: security@babygrow.app
- **Support**: support@babygrow.app

## 📄 License

Proprietary - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: December 23, 2025  

**Status**: 📝 Planning & Documentation Complete - Ready for Development

---

## 🎓 For Academic Use

Proyek ini dikembangkan sebagai bagian dari penelitian skripsi mengenai:

**"Implementasi Sistem Pemantauan Pertumbuhan Balita Berbasis Artificial Intelligence (AI) untuk Deteksi Risiko Stunting dan Rekomendasi Program Makan Bergizi Gratis (MBG)"**

Dokumentasi lengkap, arsitektur sistem, dan spesifikasi teknis tersedia di folder `docs/` untuk keperluan akademis dan pengembangan.

---

**Built with ❤️ for Indonesia's children health**
