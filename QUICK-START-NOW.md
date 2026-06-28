# 🦄 BabyGrow Unicorn 2026 - Quick Start

## ⚡ 5-Minute Setup & Test

**Metro Bundler Already Running!** ✅  
MQTT Mock Data Flowing: `📡 Mock Sensor: 79.2 cm | 10.9 kg`

---

## 🚀 Immediate Actions

### 1️⃣ TEST ON YOUR PHONE (RIGHT NOW!)

**Scan QR Code** in terminal with Expo Go app

**Expected Flow:**
```
Splash Screen (2.5s with logo)
    ↓
Onboarding (5 slides - swipe or skip)
    ↓
Ultimate Login (3D logo bouncing)
    ↓
User Dashboard
```

### 2️⃣ CREDENTIALS

**User Login:**
```
Email: user@demo.com
Password: demo123
```

**Admin Login:**
```
Email: admin@demo.com
Password: admin123
```

### 3️⃣ KEY FEATURES TO TEST

✅ **Splash Screen** (First Thing You See)
- Custom pink logo in circular frame
- "BabyGrow - Unicorn System 2026"
- Smooth fade-in animation

✅ **Onboarding Carousel** (After Splash)
- 5 slides with features
- Swipe left/right or tap "Lanjut"
- Tap "Lewati" to skip
- **Only shows once!**

✅ **Ultimate Login** (After Onboarding)
- 3D logo rotates gently
- Baby emoji bounces up/down
- Glassmorphism form
- Demo credentials shown

✅ **User Dashboard**
- Live MQTT measurement card (updates every 3s)
- Find "Ukur Otomatis" button (has NEW badge)
- Tap it → Pairing modal opens
- Watch connection → Success animation
- Modal auto-closes after 2.5s

✅ **Dark Mode**
- Go to Profile tab (👤)
- Scroll to "Mode Gelap"
- Toggle switch
- Watch theme change (Deep Charcoal + Midnight Pink)
- Restart app → Theme persists!

---

## 🎯 Success Checklist

**You should see:**

1. ✅ Splash screen with pink logo (not Expo logo)
2. ✅ 5-page onboarding (first launch only)
3. ✅ Login page with rotating logo and bouncing baby
4. ✅ Dashboard with "Ukur Otomatis" card (pink border + NEW badge)
5. ✅ Pairing modal opens with "Menghubungkan..."
6. ✅ Green checkmark ✅ when MQTT connects
7. ✅ Live measurement updates (height/weight)
8. ✅ Dark mode toggle works in Profile
9. ✅ Theme persists after restart

---

## 🐛 Troubleshooting

### Problem: Onboarding Shows Every Time
**Solution:**
```bash
# AsyncStorage not clearing properly
# In console or add this to App.tsx temporarily:
AsyncStorage.setItem('onboarding_completed', 'true');
```

### Problem: Pairing Modal Doesn't Connect
**Check:**
- MQTT mock data in terminal: `📡 Mock Sensor: X.X cm | X.X kg`
- If no logs, restart Metro: `Ctrl+C` then `npm start`

### Problem: Dark Mode Doesn't Apply
**Check:**
- Toggle in Profile → "Mode Gelap"
- Look for status badge: "✨ Aktif"
- If no change, check ThemeContext is wrapped in App.tsx

### Problem: App Crashes on Splash
**Check:**
- Logo exists: `assets/images/logo-babygrow.png`
- If missing, copy from another location

---

## 📱 Device Setup

### Android (Expo Go)
1. Install Expo Go from Play Store
2. Open app, tap "Scan QR Code"
3. Point camera at terminal QR code
4. Wait for build (~10-30 seconds)
5. App opens automatically

### iOS (Expo Go)
1. Install Expo Go from App Store
2. Open Camera app
3. Point at terminal QR code
4. Tap "Open in Expo Go" notification
5. Wait for build
6. App opens automatically

---

## 🎬 Demo Flow

**Perfect demo sequence:**

1. **Fresh Install** (clear AsyncStorage first)
   ```javascript
   AsyncStorage.clear();
   ```

2. **Restart App** (`r` in terminal)

3. **Watch Magic Happen:**
   - ✨ Splash appears (2.5s)
   - 🎠 Onboarding slides (swipe through)
   - 🚪 Login page (use demo credentials)
   - 🏠 Dashboard loads
   - 📡 Tap "Ukur Otomatis"
   - ✅ Success animation!
   - 🌙 Toggle dark mode in Profile
   - 🔄 Restart app (theme persists)

**Total demo time:** ~2 minutes

---

## 📊 What You're Seeing

### Terminal Output
```
LOG  📡 Mock Sensor: 78.3 cm | 10.2 kg  ← MQTT data
LOG  📡 Mock Sensor: 79.7 cm | 10.0 kg  ← Updates every 3s
Android Bundled 140001ms               ← Build complete
```

### Live Measurement Card
- Height updates: 78-82 cm
- Weight updates: 9-11 kg
- Green indicator: 🟢 Online
- MQTT broker: broker.emqx.io

### Z-Score Widget
- BB/U (Weight-for-Age)
- TB/U (Height-for-Age)
- BB/TB (Weight-for-Height)
- Color-coded: Green/Yellow/Orange/Red

---

## 🔥 Pro Tips

1. **Shake Device** → Opens Expo menu
   - Reload app
   - Toggle Performance Monitor
   - Enable/disable Fast Refresh

2. **Fast Testing** → Skip onboarding
   - Set `AsyncStorage.setItem('onboarding_completed', 'true')`
   - Restart app
   - Goes straight to login

3. **Dark Mode Testing**
   - Toggle in Profile
   - See immediate theme change
   - Restart app to verify persistence

4. **MQTT Monitoring**
   - Watch terminal for logs
   - Download MQTTX app for detailed monitoring
   - Broker: `broker.emqx.io:1883`
   - Topic: `babygrow/device/ESP32_VL53L0X_001/measurement`

5. **Performance Check**
   - Shake device → Performance Monitor
   - Should see 60fps consistently
   - RAM usage should be stable

---

## 🎨 Visual Preview

**Splash Screen:**
```
╔══════════════════════════════════════════╗
║   Pink Gradient Background               ║
║                                          ║
║         ┌────────────┐                   ║
║         │   🏥  💗   │   ← Logo          ║
║         │  BabyGrow  │                   ║
║         └────────────┘                   ║
║                                          ║
║        BabyGrow                          ║
║   UNICORN SYSTEM 2026                    ║
║                                          ║
╚══════════════════════════════════════════╝
```

**Onboarding Slide:**
```
╔══════════════════════════════════════════╗
║  [Skip]                                  ║
║                                          ║
║            🤖                            ║
║       (80px emoji)                       ║
║                                          ║
║    Ukur Tinggi dengan AI                ║
║                                          ║
║  Teknologi computer vision untuk        ║
║  pengukuran tinggi badan otomatis       ║
║                                          ║
║         ●○○○○  (dots)                   ║
║                                          ║
║      [    Lanjut    ]                   ║
╚══════════════════════════════════════════╝
```

**Login Page:**
```
╔══════════════════════════════════════════╗
║                                          ║
║          ┌──────────┐                    ║
║          │  🏥  💗  │  ← Rotating        ║
║          └──────────┘                    ║
║                                          ║
║            👶  ← Bouncing                ║
║                                          ║
║  ┌──────────────────────────────────┐   ║
║  │ Glassmorphism Form               │   ║
║  │                                  │   ║
║  │ Email: [................]        │   ║
║  │ Password: [........] 👁          │   ║
║  │                                  │   ║
║  │ [     MASUK     ]                │   ║
║  └──────────────────────────────────┘   ║
║                                          ║
║  Demo: user@demo.com / demo123          ║
╚══════════════════════════════════════════╝
```

---

## 📞 Need Help?

**Check These First:**
1. `UNICORN-TESTING-GUIDE.md` - Full testing checklist
2. `UNICORN-IMPLEMENTATION-SUMMARY.md` - What's implemented
3. Terminal logs - Look for errors
4. Expo Go app - Make sure it's latest version

**Common Issues:**
- QR code not scanning → Try tunnel mode: `npm start -- --tunnel`
- App crashes → Clear cache: `npm start -- --clear`
- Theme not working → Verify ThemeProvider in App.tsx
- MQTT not connecting → Check broker.emqx.io is accessible

---

## ✅ All Systems Go!

**Current Status:**
- ✅ App bundled (1496 modules)
- ✅ Metro bundler running
- ✅ MQTT mock data flowing
- ✅ No errors in console
- ✅ All 8 Unicorn features complete

**You're ready to test!** 🚀

**Just scan the QR code in your terminal with Expo Go!**

---

**Created**: 2025-12-23  
**Version**: Unicorn 2026 v1.0  
**Time to Test**: 5 minutes  
**Status**: 🔥 READY TO GO!
