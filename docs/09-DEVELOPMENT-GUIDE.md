# BabyGrow - Development Guide

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **React Native CLI** (for native development)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Java JDK** 17 (for Android)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/babygrow.git
cd babygrow
```

#### 2. Install Dependencies

```bash
# Mobile App
cd mobile-app
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

#### 3. Environment Configuration

**Mobile App (.env)**
```bash
cd mobile-app
cp .env.example .env
```

Edit `.env`:
```
API_BASE_URL=http://localhost:3000/api/v1
AI_SERVICE_URL=http://localhost:8000
MQTT_BROKER_URL=mqtt://localhost:1883
GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit environment variables as needed.

**AI Service (.env)**
```bash
cd ai-service
cp .env.example .env
```

#### 4. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres redis

# Run migrations
cd backend
npm run migration:run

# Seed initial data
npm run seed
```

#### 5. Start Development Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - AI Service**
```bash
cd ai-service
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - MQTT Broker (optional)**
```bash
docker-compose up mqtt
```

**Terminal 4 - Mobile App**
```bash
cd mobile-app
npm start
```

**Terminal 5 - Run Android**
```bash
cd mobile-app
npm run android
```

---

## 📱 Mobile App Structure

```
mobile-app/
├── src/
│   ├── api/              # API configuration & endpoints
│   ├── assets/           # Images, fonts, icons
│   ├── components/       # Reusable components
│   │   ├── common/       # Generic components (Button, Card, etc.)
│   │   ├── charts/       # Chart components
│   │   └── iot/          # IoT-related components
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── store/            # Redux store & slices
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── theme/            # Design tokens (colors, typography, spacing)
│   └── types/            # TypeScript type definitions
```

### Key Files

- **`App.tsx`** - Main app entry point
- **`src/theme/index.ts`** - Theme configuration (Halodoc pink theme)
- **`src/types/models.ts`** - TypeScript interfaces
- **`src/utils/zScoreCalculator.ts`** - WHO z-score calculations
- **`src/store/index.ts`** - Redux store setup

---

## 🎨 Design System

### Color Palette

```typescript
import { colors } from '@theme/colors';

// Primary pink color
colors.primary.main      // #FF69B4
colors.primary.light     // #FFB6C1
colors.primary.dark      // #C71585

// Status colors
colors.status.success    // #4CAF50
colors.status.warning    // #FFC107
colors.status.error      // #F44336

// Stunting levels
colors.stunting.normal           // #4CAF50
colors.stunting.atRisk           // #FFC107
colors.stunting.stunted          // #FF9800
colors.stunting.severelyStunted  // #F44336
```

### Typography

```typescript
import { typography } from '@theme/typography';

// Font families
typography.fontFamily.regular   // 'Inter-Regular'
typography.fontFamily.bold      // 'Inter-Bold'

// Predefined styles
typography.variants.h1
typography.variants.body1
typography.variants.button
```

### Spacing

```typescript
import { spacing } from '@theme/spacing';

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px
```

---

## 🔧 Development Workflow

### Creating New Components

1. **Create component file**
```typescript
// src/components/common/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
  },
  text: {
    ...typography.variants.button,
    color: colors.text.inverse,
  },
});
```

2. **Export from index**
```typescript
// src/components/common/index.ts
export { CustomButton } from './CustomButton';
```

### Creating New Screens

1. **Create screen file**
```typescript
// src/screens/children/AddChildScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const AddChildScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>Add Child Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});
```

2. **Add to navigation**
```typescript
// src/navigation/MainNavigator.tsx
import { AddChildScreen } from '@screens/children/AddChildScreen';

// Add to Stack.Screen
<Stack.Screen name="AddChild" component={AddChildScreen} />
```

### State Management with Redux

1. **Create slice**
```typescript
// src/store/slices/childrenSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Child } from '@types/models';

interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;
}

const initialState: ChildrenState = {
  children: [],
  selectedChild: null,
  isLoading: false,
};

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setChildren(state, action: PayloadAction<Child[]>) {
      state.children = action.payload;
    },
    selectChild(state, action: PayloadAction<Child>) {
      state.selectedChild = action.payload;
    },
  },
});

export const { setChildren, selectChild } = childrenSlice.actions;
export default childrenSlice.reducer;
```

2. **Add to store**
```typescript
// src/store/index.ts
import childrenReducer from './slices/childrenSlice';

export const store = configureStore({
  reducer: {
    children: childrenReducer,
    // ... other reducers
  },
});
```

3. **Use in component**
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { setChildren } from '@store/slices/childrenSlice';

const MyComponent = () => {
  const children = useSelector(state => state.children.children);
  const dispatch = useDispatch();

  const loadChildren = () => {
    dispatch(setChildren([/* data */]));
  };
};
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Component Tests

```typescript
// __tests__/components/CustomButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '@components/common/CustomButton';

describe('CustomButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CustomButton title="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Click Me" onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Click Me'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 📦 Building for Production

### Android

```bash
cd mobile-app
cd android

# Generate release APK
./gradlew assembleRelease

# Generate release AAB (for Play Store)
./gradlew bundleRelease

# Output:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

```bash
cd mobile-app
cd ios

# Install pods
pod install

# Open Xcode
open BabyGrow.xcworkspace

# Build from Xcode: Product > Archive
```

---

## 🔍 Debugging

### React Native Debugger

1. Install React Native Debugger
2. Start app with `npm start`
3. Press `Cmd+D` (iOS) or `Cmd+M` (Android)
4. Select "Debug"

### Flipper

```bash
# Start Flipper
npx react-native-flipper

# Features:
# - Network inspector
# - Layout inspector
# - Redux state viewer
# - Console logs
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    }
  ]
}
```

---

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [WHO Growth Standards](https://www.who.int/tools/child-growth-standards)
- [React Navigation](https://reactnavigation.org/)

---

## 🐛 Common Issues & Solutions

### Metro Bundler Issues

```bash
# Clear cache
npm start -- --reset-cache

# Clear watchman
watchman watch-del-all

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Android Build Issues

```bash
# Clean build
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug
```

### iOS Build Issues

```bash
# Clean build folder
cd ios
rm -rf build
rm -rf Pods
pod deintegrate
pod install
```

---

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Code Style

- Use ESLint & Prettier
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎉**
