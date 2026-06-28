# BabyGrow - Visual Summary & Quick Reference

## 🎨 Application Logo Concept

```
        ┌─────────────────────────────────────┐
        │                                     │
        │         ⚖️  BabyGrow  💗           │
        │                                     │
        │    ┌───────────────────────┐        │
        │    │    ▄▄▄▄▄▄▄▄▄▄▄▄▄     │        │
        │    │   ███████████████     │        │
        │    │   ██ PINK      ██     │        │
        │    │   ██  SCALE    ██     │        │
        │    │   ███████████████     │        │
        │    │      ▀▀▀▀▀▀▀▀▀        │        │
        │    │         ││            │        │
        │    │       ══╬╬══          │        │
        │    └───────────────────────┘        │
        │                                     │
        │  Pantau Pertumbuhan Buah Hati      │
        │    dengan Teknologi AI              │
        │                                     │
        └─────────────────────────────────────┘
```

## 📱 Screen Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY MAP                              │
└─────────────────────────────────────────────────────────────────┘

[SPLASH] → [ONBOARDING] → [REGISTER/LOGIN]
                               │
                               ▼
                          [HOME SCREEN]
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    [CHILD LIST]         [MEASUREMENTS]        [RECIPES]
          │                    │                    │
          ▼                    ▼                    ▼
   [CHILD DETAIL]      [IoT/MANUAL INPUT]    [MEAL PLANS]
          │                    │                    │
          ▼                    ▼                    ▼
   [GROWTH CHARTS]      [AI ANALYSIS]        [SHOPPING LIST]
                               │
                               ▼
                      [RISK ASSESSMENT]
                               │
                               ▼
                      [RECOMMENDATIONS]
```

## 🏗️ System Architecture Simplified

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                               │
│  ┌────────────────┐         ┌──────────────────┐                │
│  │  Mobile App    │         │  IoT Devices     │                │
│  │  React Native  │◄───BLE──┤  Smart Scale     │                │
│  │                │         │  Height Meter    │                │
│  └────────┬───────┘         └────────┬─────────┘                │
│           │                          │                           │
└───────────┼──────────────────────────┼───────────────────────────┘
            │ HTTPS/WSS                │ MQTT
┌───────────▼──────────────────────────▼───────────────────────────┐
│                      API GATEWAY                                  │
│                   Load Balancer + Auth                            │
└───────────┬──────────────────────────┬───────────────────────────┘
            │                          │
┌───────────▼──────────────────────────▼───────────────────────────┐
│                   APPLICATION LAYER                               │
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  NestJS Backend  │◄───────▶│  FastAPI AI      │              │
│  │  • Auth          │         │  • ML Model      │              │
│  │  • CRUD APIs     │         │  • WHO Standards │              │
│  │  • IoT Service   │         │  • Predictions   │              │
│  │  • WebSocket     │         └──────────────────┘              │
│  └────────┬─────────┘                                            │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────────────┐
│                       DATA LAYER                                  │
│                                                                   │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐            │
│  │ PostgreSQL   │  │   Redis    │  │   AWS S3     │            │
│  │ + TimescaleDB│  │   Cache    │  │  File Store  │            │
│  └──────────────┘  └────────────┘  └──────────────┘            │
└───────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Features Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE MATRIX                                │
├─────────────────┬───────────────┬──────────────┬────────────────┤
│ FEATURE         │ COMPLEXITY    │ PRIORITY     │ PHASE          │
├─────────────────┼───────────────┼──────────────┼────────────────┤
│ Authentication  │ Medium        │ ⭐⭐⭐⭐⭐  │ Phase 1 (MVP)  │
│ Child Profiles  │ Low           │ ⭐⭐⭐⭐⭐  │ Phase 1 (MVP)  │
│ Manual Input    │ Low           │ ⭐⭐⭐⭐⭐  │ Phase 1 (MVP)  │
│ Growth Charts   │ Medium        │ ⭐⭐⭐⭐⭐  │ Phase 1 (MVP)  │
│ BLE Integration │ High          │ ⭐⭐⭐⭐    │ Phase 2        │
│ MQTT/WiFi       │ High          │ ⭐⭐⭐      │ Phase 2        │
│ AI Stunting     │ High          │ ⭐⭐⭐⭐⭐  │ Phase 3        │
│ WHO Standards   │ Medium        │ ⭐⭐⭐⭐⭐  │ Phase 3        │
│ Recipe Database │ Medium        │ ⭐⭐⭐⭐    │ Phase 4        │
│ Meal Plans      │ Medium        │ ⭐⭐⭐⭐    │ Phase 4        │
│ Notifications   │ Low           │ ⭐⭐⭐⭐    │ Phase 4        │
│ Analytics       │ Low           │ ⭐⭐⭐      │ Phase 5        │
└─────────────────┴───────────────┴──────────────┴────────────────┘
```

## 📊 Data Model Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                              │
└────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│    USERS     │         │   CHILDREN   │
├──────────────┤         ├──────────────┤
│ • id         │◄───1:N──┤ • id         │
│ • email      │         │ • user_id    │
│ • password   │         │ • name       │
│ • full_name  │         │ • dob        │
│ • phone      │         │ • gender     │
└──────────────┘         └──────┬───────┘
                                │
                                │ 1:N
                                │
                         ┌──────▼─────────────┐
                         │  MEASUREMENTS      │
                         ├────────────────────┤
                         │ • id               │
                         │ • child_id         │
                         │ • weight_kg        │
                         │ • height_cm        │
                         │ • measured_at      │
                         │ • source (IoT/Man) │
                         └──────┬─────────────┘
                                │
                                │ 1:N
                                │
                         ┌──────▼──────────────┐
                         │  ASSESSMENTS        │
                         ├─────────────────────┤
                         │ • id                │
                         │ • measurement_id    │
                         │ • risk_level        │
                         │ • confidence        │
                         │ • wfa_zscore        │
                         │ • hfa_zscore        │
                         └─────────────────────┘

┌──────────────┐         ┌──────────────┐
│   RECIPES    │         │  MEAL_PLANS  │
├──────────────┤         ├──────────────┤
│ • id         │◄───N:M──┤ • id         │
│ • title      │         │ • child_id   │
│ • category   │         │ • start_date │
│ • nutrition  │         │ • end_date   │
│ • ingredients│         └──────────────┘
└──────────────┘
```

## 🎨 Color Palette (Halodoc-inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│                      COLOR SCHEME                                │
└─────────────────────────────────────────────────────────────────┘

PRIMARY PINK
┌─────────────────────┐
│   #FF69B4 ███████   │  Hot Pink (Main brand color)
│   #FFB6C1 ███████   │  Light Pink (Hover states)
│   #C71585 ███████   │  Deep Pink (Active states)
└─────────────────────┘

SECONDARY
┌─────────────────────┐
│   #FFA07A ███████   │  Light Salmon (Accents)
│   #FFD4B8 ███████   │  Peach (Soft backgrounds)
└─────────────────────┘

NEUTRAL
┌─────────────────────┐
│   #FFFFFF ███████   │  White
│   #F5F5F5 ███████   │  Background
│   #E0E0E0 ███████   │  Borders
│   #9E9E9E ███████   │  Secondary text
│   #212121 ███████   │  Primary text
└─────────────────────┘

STATUS
┌─────────────────────┐
│   #4CAF50 ███████   │  Success / Normal
│   #FFC107 ███████   │  Warning / At Risk
│   #FF9800 ███████   │  Alert / Stunted
│   #F44336 ███████   │  Error / Severe
└─────────────────────┘
```

## 📅 Development Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  PROJECT GANTT CHART                             │
└─────────────────────────────────────────────────────────────────┘

Month │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │12 │13 │14 │15 │
──────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
MVP   │███│███│███│███│   │   │   │   │   │   │   │   │   │   │   │
IoT   │   │   │   │   │███│███│███│   │   │   │   │   │   │   │   │
AI    │   │   │   │   │   │   │   │███│███│███│   │   │   │   │   │
MBG   │   │   │   │   │   │   │   │   │   │   │███│███│   │   │   │
Polish│   │   │   │   │   │   │   │   │   │   │   │   │███│███│   │
Launch│   │   │   │   │   │   │   │   │   │   │   │   │   │   │🚀 │
──────┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

Legend:
███ = Active Development
🚀  = Production Launch
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

             ┌───────────────────────────┐
             │   NETWORK SECURITY        │
             │   • TLS 1.3               │
             │   • DDoS Protection       │
             │   • Firewall Rules        │
             └───────────┬───────────────┘
                         │
             ┌───────────▼───────────────┐
             │   APPLICATION SECURITY    │
             │   • JWT Auth              │
             │   • Rate Limiting         │
             │   • Input Validation      │
             └───────────┬───────────────┘
                         │
             ┌───────────▼───────────────┐
             │   DATA SECURITY           │
             │   • Encryption at Rest    │
             │   • Encryption in Transit │
             │   • Secure Key Management │
             └───────────┬───────────────┘
                         │
             ┌───────────▼───────────────┐
             │   ACCESS CONTROL          │
             │   • RBAC                  │
             │   • Least Privilege       │
             │   • Session Management    │
             └───────────┬───────────────┘
                         │
             ┌───────────▼───────────────┐
             │   MONITORING              │
             │   • Security Logging      │
             │   • Intrusion Detection   │
             │   • Incident Response     │
             └───────────────────────────┘
```

## 📊 AI Model Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI/ML WORKFLOW                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  RAW DATA    │  Age, Gender, Weight, Height, History
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  PREPROCESSING           │
│  • Normalization         │
│  • Feature Engineering   │
│  • WHO Z-score Calc      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  NEURAL NETWORK          │
│  Input Layer (12 nodes)  │
│  Hidden (128→64→32→16)   │
│  Output Layer (4 classes)│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  PREDICTION              │
│  • Normal                │
│  • At Risk               │
│  • Stunted               │
│  • Severely Stunted      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  POST-PROCESSING         │
│  • Risk Analysis         │
│  • Factor Identification │
│  • Recommendations       │
└──────────────────────────┘
```

## 💰 Cost Breakdown (Monthly)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE COSTS                          │
└─────────────────────────────────────────────────────────────────┘

Service                    Tier              Cost (USD)
─────────────────────────────────────────────────────────
Compute (EC2/Compute)      t3.medium         $30-50
Database (RDS)             db.t3.small       $25-40
Redis Cache                Micro             $15-25
S3 Storage                 50GB              $5-10
CDN                        100GB transfer    $10-15
MQTT Broker                Light usage       $5-10
Monitoring                 Essential         $15-25
─────────────────────────────────────────────────────────
TOTAL MONTHLY                                ~$105-175
TOTAL ANNUALLY                               ~$1,260-2,100
```

## 📱 Mobile App Screens Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEY SCREENS                                   │
└─────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION
   ├─ Splash Screen
   ├─ Onboarding (3 slides)
   ├─ Login
   └─ Register

2. MAIN NAVIGATION (Bottom Tabs)
   ├─ 🏠 Home Dashboard
   ├─ 👶 Children List
   ├─ 📊 Growth Charts
   ├─ 🥘 Recipes
   └─ 👤 Profile

3. CHILD MANAGEMENT
   ├─ Child List
   ├─ Child Detail
   ├─ Add/Edit Child
   └─ Growth History

4. MEASUREMENTS
   ├─ Manual Input
   ├─ IoT Device Pairing
   ├─ Real-time Measurement
   └─ Measurement History

5. AI ASSESSMENT
   ├─ Processing Screen
   ├─ Risk Assessment Result
   ├─ Growth Charts (WHO)
   └─ Recommendations

6. NUTRITION
   ├─ Recipe List
   ├─ Recipe Detail
   ├─ Meal Planner
   └─ Shopping List

7. SETTINGS
   ├─ Profile Settings
   ├─ Notification Preferences
   ├─ IoT Devices
   └─ Privacy & Security
```

## 🎯 Success Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    KPIs & TARGETS                                │
└─────────────────────────────────────────────────────────────────┘

TECHNICAL METRICS
┌────────────────────────────┬──────────┬───────────┐
│ Metric                     │ Target   │ Status    │
├────────────────────────────┼──────────┼───────────┤
│ App Launch Time            │ < 2s     │ 🎯        │
│ API Response (p95)         │ < 500ms  │ 🎯        │
│ AI Inference Time          │ < 100ms  │ 🎯        │
│ Crash-free Rate            │ > 99%    │ 🎯        │
│ Model Accuracy             │ > 85%    │ 🎯        │
└────────────────────────────┴──────────┴───────────┘

BUSINESS METRICS
┌────────────────────────────┬──────────┬───────────┐
│ Metric                     │ Target   │ Period    │
├────────────────────────────┼──────────┼───────────┤
│ User Acquisition           │ 10,000   │ 6 months  │
│ User Retention (30 days)   │ > 40%    │ Ongoing   │
│ Daily Active Users         │ > 20%    │ Ongoing   │
│ Measurements per User/mo   │ > 4      │ Ongoing   │
│ Recipe Views per User/mo   │ > 10     │ Ongoing   │
│ Meal Plan Adoption         │ > 30%    │ Ongoing   │
└────────────────────────────┴──────────┴───────────┘
```

## 📞 Quick Contact Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTACT INFORMATION                           │
└─────────────────────────────────────────────────────────────────┘

Developer:       [Your Name]
Email:           dev@babygrow.app
Security:        security@babygrow.app
Support:         support@babygrow.app

Repository:      github.com/yourusername/babygrow
Documentation:   /docs
License:         Proprietary
Version:         1.0.0
Status:          📝 Planning → 🚀 Ready for Development
```

---

## 🚀 Next Steps Checklist

```
IMMEDIATE ACTIONS (Week 1)
☐ Setup development environment
☐ Create GitHub repository
☐ Initialize project structure
☐ Setup CI/CD pipeline
☐ Configure Docker containers
☐ Design logo (pink timbangan)
☐ Create Figma workspace
☐ Setup project management board

PHASE 1 PREPARATION (Week 2)
☐ Backend: Initialize NestJS
☐ Backend: Setup PostgreSQL + TimescaleDB
☐ Backend: Configure Redis
☐ Mobile: Initialize React Native
☐ Mobile: Setup navigation structure
☐ Mobile: Configure theme (pink)
☐ AI Service: Initialize FastAPI
☐ Infrastructure: Setup staging environment

SPRINT 1 GOALS (Week 3-4)
☐ Backend: Authentication endpoints
☐ Backend: User management APIs
☐ Backend: Database migrations
☐ Mobile: Login/Register screens
☐ Mobile: Redux setup
☐ Testing: Unit tests for auth
☐ Documentation: API documentation
```

---

**Built with ❤️ for Indonesia's children health**

**Ready to transform child health monitoring! 🚀**
