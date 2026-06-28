# 🦄 Quick Reference - BabyGrow Unicorn 2026

## 🚀 Cara Menjalankan App

### **Method 1: Start Script (Recommended)**
```powershell
cd C:\BabyGrow\mobile-app
npm start
```

### **Method 2: Manual**
```powershell
cd C:\BabyGrow\mobile-app
npx expo start --clear
```

### **Method 3: Tunnel (Jika QR tidak bisa scan)**
```powershell
cd C:\BabyGrow\mobile-app
npm start -- --tunnel
```

---

## 📱 User Flow Lengkap

### **1. First Launch**
```
App Launch
    ↓
Splash Screen (Logo BabyGrow 3D + Glow)
    ↓ (2 detik fade)
Onboarding - 5 Slides:
    1️⃣ Pantau Pertumbuhan (Logo 3D besar)
    2️⃣ Pairing IoT Bluetooth
    3️⃣ Deteksi Risiko AI
    4️⃣ Rekomendasi MBG
    5️⃣ Grafik WHO
    ↓
Login Screen Unicorn
    ↓
Dashboard
```

### **2. Pairing BabyGrow_Alat**
```
Dashboard
    ↓ Tap "🔗 Ukur Otomatis"
Pairing Modal (3D Glassmorphism)
    ↓
STATE: Scanning
"🔍 Mencari BabyGrow_Alat..."
    ↓ (10 detik max)
STATE: Connecting
"🔗 Menghubungkan ke BabyGrow_Alat..."
    ↓ (BLE handshake)
STATE: Success ✅
"Alat Terkoneksi via Bluetooth"
• Device ID
• Battery Level
• Signal Strength
    ↓ (Auto-close 2.5s)
Dashboard (Real-time data streaming)
```

### **3. Dark Mode Toggle**
```
Dashboard
    ↓ Tap "👤 Profil"
ProfileScreen
    ↓ Scroll down to Settings
Find "🌙 Dark Mode" Toggle
    ↓ Switch ON
Deep Purple/Pink Theme Applied
    ↓
All screens update instantly
```

---

## 🎨 Design System Cheat Sheet

### **Colors**

**Dark Mode (Deep Purple/Pink):**
```typescript
Background Primary: #1A0E2E  (Deep Purple)
Background Secondary: #2D1B3D
Card Background: #2D1B3D

Text Primary: #FFFFFF
Text Secondary: #E0B3FF  (Light Purple)
Text Tertiary: #B794F6

Primary Pink: #FF69B4
Primary Pink Light: #FFB6C1
Primary Pink Dark: #C71585

Accent Purple: #9B59B6
Accent Purple Light: #C39BD3

Gradients:
- Primary: [#FF69B4 → #9B59B6]
- Dark: [#1A0E2E → #2D1B3D]
- Success: [#4CAF50 → #66BB6A]
```

**Light Mode:**
```typescript
Background: #FAFAFA
Card: #FFFFFF
Text: #333333

Primary Pink: #FF69B4
Accent Coral: #FFA07A
```

### **Typography**
```typescript
Font Family: Inter

Sizes:
- xs: 12px (labels)
- sm: 14px (body)
- md: 16px (primary body)
- lg: 18px (large body)
- xl: 20px (section headers)
- 2xl: 24px (page titles)
- 3xl: 28px (large headings)
- 4xl: 32px (hero text)

Weights:
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700
```

### **Spacing**
```typescript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

### **Border Radius**
```typescript
sm: 4px (small elements)
md: 8px (buttons, inputs)
lg: 12px (cards)
xl: 16px (large cards)
2xl: 24px (bottom sheets)
full: 9999px (pills, circles)
```

---

## 🔌 BLE Integration

### **Device Specifications**

**Target Device Name:**
```
BabyGrow_Alat
```

**BLE Service UUIDs:**
```typescript
SERVICE_UUID: 0000fff0-0000-1000-8000-00805f9b34fb

Characteristics:
HEIGHT:  0000fff1-0000-1000-8000-00805f9b34fb  (Float32, cm)
WEIGHT:  0000fff2-0000-1000-8000-00805f9b34fb  (Float32, kg)
BATTERY: 0000fff3-0000-1000-8000-00805f9b34fb  (Uint8, %)
```

### **Mock Mode (Current)**
```typescript
// In BLEService.ts
private mockMode: boolean = true; // ← Testing mode ON

// Mock data generated:
Height: 75.0 - 85.0 cm (random)
Weight: 9.5 - 11.0 kg (random)
Battery: 87%
Signal: -45 dBm
Update interval: 3 seconds
```

### **Production Mode (Real BLE)**
```typescript
// Steps to enable:
1. Install: npm install react-native-ble-plx
2. Update BLEService.ts: mockMode = false
3. Flash ESP32 with BLE firmware
4. Test with real hardware
```

---

## 📂 File Structure Reference

### **New Files Added**
```
src/
├── services/
│   └── BLEService.ts                    // Bluetooth Low Energy service
├── theme/
│   └── darkMode.ts                      // Deep Purple/Pink theme
└── components/
    └── common/
        └── ThemeContext.tsx              // Theme provider & hook
```

### **Modified Files**
```
app.json                                 // Logo + BLE permissions
src/screens/OnboardingScreen.tsx         // 5 slides + 3D logo
src/components/common/PairingModal.tsx   // BLE integration
```

### **Logo Asset**
```
assets/images/logo-babygrow.png          // Main logo (configured in app.json)
```

---

## 🛠️ Development Commands

### **Start Development Server**
```powershell
npm start
```

### **Clear Cache**
```powershell
npm start -- --clear
```

### **Tunnel Mode (Network issues)**
```powershell
npm start -- --tunnel
```

### **Check IP Address**
```powershell
ipconfig | findstr "IPv4"
```

### **Kill Expo Process**
```powershell
taskkill /F /IM node.exe
```

### **Reinstall Dependencies**
```powershell
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force
npm install
```

---

## 🧪 Testing Checklist

### **Logo & Branding**
- [ ] Splash screen shows BabyGrow logo (not Expo)
- [ ] App icon di home screen (not Expo square)
- [ ] Background color: Pink (#FFC1CC)
- [ ] Logo size: 180x180 with glow effect

### **Onboarding (5 Slides)**
- [ ] Slide 1: Logo 3D + badges "Standar WHO", "Mudah & Cepat"
- [ ] Slide 2: Illustration 📱🔌
- [ ] Slide 3: Illustration 🧠✨
- [ ] Slide 4: Illustration 🍎🥗
- [ ] Slide 5: Illustration 📊📈
- [ ] Skip button (blur effect)
- [ ] Next/Mulai button (pink gradient)
- [ ] Dots indicator (animated)
- [ ] Smooth 60fps animations

### **BLE Pairing**
- [ ] Klik "Ukur Otomatis" button
- [ ] Modal dengan glassmorphism (Pink → Purple gradient)
- [ ] State: Scanning → "Mencari BabyGrow_Alat..."
- [ ] State: Connecting → "Menghubungkan..."
- [ ] State: Success → Green glow checklist
- [ ] Device info: ID, Battery, Signal
- [ ] Auto-close setelah 2.5 detik
- [ ] Real-time data streaming (mock: 3s interval)

### **Dark Mode**
- [ ] Toggle di ProfileScreen
- [ ] Deep Purple background (#1A0E2E)
- [ ] White text (#FFFFFF)
- [ ] Pink/Purple accents
- [ ] Glassmorphism masih smooth
- [ ] All screens adapt instantly
- [ ] Preference saved to AsyncStorage

### **Performance**
- [ ] No lag saat scroll onboarding
- [ ] 60fps animations (spring tension: 40-50)
- [ ] No memory leaks (test 5+ minutes)
- [ ] Battery drain reasonable

### **Features Preservation**
- [ ] Gemini AI Assistant works
- [ ] Z-Score calculations accurate
- [ ] RBAC system enforced
- [ ] Growth charts display
- [ ] Manual measurements functional

---

## 🐛 Troubleshooting

### **Logo tidak muncul?**
```powershell
# Clear Expo cache
npm start -- --clear

# Delete app dari device, reinstall
# Restart Expo Go
```

### **BLE tidak konek?**
```
Checklist:
✓ Bluetooth ON di smartphone
✓ Location permission granted (Android)
✓ Device name = "BabyGrow_Alat" exactly
✓ Mock mode ON (untuk testing tanpa hardware)
```

### **Dark Mode tidak save?**
```typescript
// Clear AsyncStorage
await AsyncStorage.clear();
// Restart app
```

### **Animations laggy?**
```typescript
// Check useNativeDriver: true
// Verify spring config:
{
  tension: 40-50,
  friction: 7-8,
  useNativeDriver: true
}
```

### **Expo Go crash?**
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Clear all caches
npm start -- --clear

# Reinstall Expo Go di device
```

---

## 📊 Production Readiness

### **Current Status: MOCK MODE**
✅ Logo configured  
✅ 5-slide onboarding  
✅ BLE service (mock)  
✅ Dark mode system  
✅ Glassmorphism UI  
✅ Permissions configured  
⏳ Real BLE hardware testing  
⏳ Lottie animations (Login)  

### **Next Steps for Production:**

**1. Real BLE Hardware:**
```bash
# Install BLE library
npm install react-native-ble-plx

# Update BLEService.ts
private mockMode: boolean = false;

# Flash ESP32 with firmware
# Test with real BabyGrow_Alat device
```

**2. Lottie Animations:**
```bash
# Install Lottie
npm install lottie-react-native

# Add baby animation to LoginScreen
<LottieView 
  source={require('./assets/baby.json')} 
  autoPlay 
  loop 
/>
```

**3. App Store Preparation:**
- Update version: 2.0.0-unicorn
- Create screenshots (5 slides)
- Prepare store listing
- Test on TestFlight/Play Console

---

## 🎯 Feature Highlights

### **✅ Implemented**
- **5-Slide Onboarding** with 3D logo
- **BLE Pairing System** (mock mode)
- **Deep Purple/Pink Dark Mode**
- **3D Glassmorphism** modals
- **Spring Animations** 60fps
- **Logo Integration** (replace Expo)
- **Bluetooth Permissions** (iOS/Android)

### **✅ Preserved**
- Gemini AI Assistant
- WHO Z-Score Calculator
- RBAC System
- MQTT Service (coexist with BLE)
- All existing screens

### **⏳ Pending**
- Lottie baby animation (Login)
- Real BLE hardware testing
- Production API integration
- App store submission

---

## 📞 Quick Support

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Logo not showing | `npm start -- --clear` |
| BLE not connecting | Check Bluetooth ON + Location permission |
| Dark mode not saving | Clear AsyncStorage |
| Animations laggy | Verify `useNativeDriver: true` |
| Expo Go crash | Kill node.exe, restart server |

**Contact:**
- Documentation: `MASTER-PROMPT-COMPLETE.md`
- Pairing Guide: `CARA-PAIRING-IOT.md`
- Mock Data Explained: `MOCK-DATA-EXPLANATION.md`

---

**🦄 Unicorn 2026 Standard: ACHIEVED!**

**Version**: 2.0.0-unicorn  
**Status**: Production Ready (mock mode)  
**Next**: Test with real BabyGrow_Alat hardware

---

_Last Updated: 25 Januari 2026_
