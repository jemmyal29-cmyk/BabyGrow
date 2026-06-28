# BabyGrow - AI Agent Instructions

## Project Overview
BabyGrow is a React Native Expo app for Android that monitors toddler growth using IoT devices and AI to detect stunting risks. It integrates smart scales/height meters via BLE/MQTT and provides WHO-compliant growth analysis with nutrition recommendations (MBG program).

## Architecture
- **Mobile App**: React Native + Expo SDK 54 (TypeScript)
- **Backend**: NestJS (planned, not yet implemented)
- **AI Service**: Python FastAPI for stunting detection (planned)
- **IoT**: BLE for direct device connection, MQTT over WiFi for remote devices
- **Data**: PostgreSQL + TimescaleDB, Redis cache, S3/GCS for media

## Critical Workflows

### Development
```powershell
# Start development server (from mobile-app/)
npm start
# OR
expo start

# Run on specific platform
npm run android  # Android emulator/device
npm run ios      # iOS (not primary target)
npm run web      # Web browser
```

### Python Environment Setup
Always call `configure_python_environment` tool before running Python commands for AI/ML components.

## Project-Specific Patterns

### Theme System (Halodoc-Inspired)
- **Primary color**: `#FF69B4` (Hot Pink) - used extensively
- Import centralized theme: `import { colors, typography, spacing } from '@theme'`
- All theme files in [../mobile-app/src/theme/](../mobile-app/src/theme/)
- Design tokens: `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `zIndex`

### Component Structure
- Use barrel exports: `import { Button, Card } from '@components/common'`
- Props interfaces: Named `ComponentNameProps` with JSDoc
- Common components in [../mobile-app/src/components/common/](../mobile-app/src/components/common/)
- Variants: `primary | secondary | outline | text` pattern for buttons
- Sizes: `small | medium | large` for all interactive components

Example button:
```tsx
<Button 
  title="Label" 
  variant="primary" 
  size="medium"
  loading={false}
  disabled={false}
/>
```

### Navigation
- Bottom tabs (4 screens): Beranda, Anak, Grafik, Profil
- Tab bar uses emoji icons (🏠, 👶, 📊, 👤)
- Active color: `#FF69B4`, inactive: `#999`
- No header shown: `headerShown: false`

### API Layer
- Axios instance in [config.ts](../mobile-app/src/api/config.ts) (line 13)
- Auto-injects Bearer token from AsyncStorage `access_token` key
- Base URL: `process.env.API_BASE_URL` or `http://localhost:3000/api/v1`
- 30s timeout default
- Request/response logging in `__DEV__` mode

### Type System
- All models in [../mobile-app/src/types/models.ts](../mobile-app/src/types/models.ts)
- Key types: `User`, `Child`, `Measurement`, `ZScore`, `StuntingAssessment`
- Use strict TypeScript - avoid `any`
- Import types: `import { Child, Measurement } from '@types/models'`

### WHO Growth Standards
- Z-score calculator in [../mobile-app/src/utils/zScoreCalculator.ts](../mobile-app/src/utils/zScoreCalculator.ts)
- LMS method: `Z = ((value/M)^L - 1) / (L*S)`
- Interpolation for exact age matching
- Separate reference data for boys/girls, weight/height
- **Note**: Current implementation uses simplified reference data - production needs complete WHO dataset

### Language & Localization
- Primary language: Indonesian (Bahasa Indonesia)
- UI labels use Indonesian: "Beranda", "Anak", "Grafik", "Profil"
- Code/comments: English preferred for technical documentation

## Dependencies & Setup
- **Node.js**: LTS version required (v20+)
- **Expo CLI**: Installed via `npx expo`
- **Expo Go**: Required on Android device for testing
- See [../INSTALL-GUIDE.md](../INSTALL-GUIDE.md) for complete setup

## Documentation Structure
Comprehensive docs in `docs/` folder - always reference before major changes:
- [../docs/01-ARCHITECTURE.md](../docs/01-ARCHITECTURE.md): System design, data flows
- [../docs/02-TECH-STACK-DETAIL.md](../docs/02-TECH-STACK-DETAIL.md): Dependencies, versions
- [../docs/04-UI-MOCKUPS.md](../docs/04-UI-MOCKUPS.md): Design system, wireframes
- [../docs/05-IOT-INTEGRATION.md](../docs/05-IOT-INTEGRATION.md): BLE/MQTT protocols
- [../docs/06-AI-MODEL-SPECS.md](../docs/06-AI-MODEL-SPECS.md): ML model architecture

## Common Pitfalls
- **Wrong directory**: Always work in `mobile-app/` subdirectory for React Native code
- **SDK version**: Using Expo SDK 54 - check compatibility before adding packages
- **Path aliases**: Use `@theme`, `@components`, `@types` imports (configured in tsconfig.json)
- **AsyncStorage**: Key for auth token is `access_token` (not `token` or `authToken`)

## File Naming
- Components: PascalCase (`Button.tsx`, `GrowthChart.tsx`)
- Utils/Config: camelCase (`zScoreCalculator.ts`, `config.ts`)
- Types: singular (`models.ts` not `model.ts`)
- Screens: Suffix with "Screen" (`HomeScreen.tsx`)
