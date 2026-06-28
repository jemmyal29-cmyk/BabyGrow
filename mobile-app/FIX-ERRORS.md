# 🔧 BabyGrow - Error Fixing Guide

## ✅ PERBAIKAN YANG SUDAH DILAKUKAN:

### 1. **React Native Reanimated Plugin**
- ✅ Added `react-native-reanimated/plugin` to babel.config.js
- ✅ Installed `react-native-worklets` package
- ✅ Cleared Expo and Metro cache

### 2. **Dependencies Fixed**
- ✅ Removed conflicting `@testing-library/react-native`
- ✅ Installed 877 packages with `--legacy-peer-deps`
- ✅ React 19.1.0 + Expo SDK 54 working together

---

## 🚀 CARA START APLIKASI:

### **Metode 1 - Recommended (PowerShell Script):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "C:\BabyGrow\mobile-app\start-metro.ps1"
```

### **Metode 2 - Manual:**
```powershell
cd C:\BabyGrow\mobile-app
npx expo start --clear
```

### **Metode 3 - Jika error persist:**
```powershell
cd C:\BabyGrow\mobile-app
Remove-Item -Path .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue
npx expo start --clear
```

---

## 🔴 COMMON ERRORS & SOLUTIONS:

### Error 1: "Cannot find module 'react-native-worklets/plugin'"
**Solution:** ✅ FIXED! Already installed react-native-worklets

### Error 2: "TransformError: Cannot find module 'react-refresh/babel'"
**Solution:** ✅ FIXED! Already installed react-refresh

### Error 3: "ENOENT: no such file or directory, open package.json"
**Cause:** Running from wrong directory (C:\BabyGrow instead of C:\BabyGrow\mobile-app)
**Solution:** Always use full path: `cd C:\BabyGrow\mobile-app`

### Error 4: "Unable to connect to Metro Bundler"
**Cause:** HP dan PC di WiFi berbeda, atau firewall blocking
**Solutions:**
1. Pastikan HP dan PC di WiFi yang SAMA
2. Atau gunakan tunnel mode: `npx expo start --tunnel`
3. Atau disable Windows Firewall temporary

### Error 5: "Bundler cache is empty, rebuilding"
**This is NORMAL!** First time after cache clear akan lama (1-2 menit)

### Error 6: "Module not found" untuk custom modules
**Solution:** Rebuild native modules:
```powershell
cd C:\BabyGrow\mobile-app
Remove-Item -Path node_modules -Recurse -Force
npm install --legacy-peer-deps
npx expo start --clear
```

---

## 📱 CARA AKSES APLIKASI:

1. **Buka PowerShell window** yang menampilkan QR code
2. **Scan QR code** dengan Expo Go app di HP Android
3. **Atau ketik URL manual:** `exp://192.168.0.113:8081`
4. Tunggu **bundling selesai** (20-40 detik pertama kali)
5. **App akan terbuka!**

---

## ⚙️ JIKA MASIH ERROR SETELAH SCAN:

### Scenario A: "Uncaught Error: Cannot find module..."
**Solution:**
1. Di Metro Bundler, tekan `r` untuk reload
2. Atau tekan `Shift + R` untuk hard reload
3. Atau stop Metro (Ctrl+C), lalu start lagi dengan `--clear`

### Scenario B: "Invariant Violation: "main" has not been registered"
**Solution:**
```powershell
cd C:\BabyGrow\mobile-app
npx expo start --clear
# Di HP, close Expo Go completely dan buka lagi
```

### Scenario C: App crash saat buka
**Solution:** Simplify App.tsx temporarily:
```tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>BabyGrow Test</Text>
    </View>
  );
}
```

---

## 🎯 NEXT STEPS SETELAH APP JALAN:

1. ✅ Verify app opens without crash
2. ✅ Test navigation (bottom tabs)
3. ✅ Test one screen at a time
4. ✅ Add features gradually
5. ❌ JANGAN tambah dependencies baru sebelum stable!

---

## 📊 CURRENT STATUS:

```
✅ Dependencies: 877 packages installed
✅ React: 19.1.0
✅ React Native: 0.81.5
✅ Expo SDK: 54.0.32
✅ Zustand: 4.5.0
✅ Reanimated: 3.10.1 (with worklets plugin)
✅ FlashList: 1.8.3
✅ React Hook Form: 7.51.0
✅ Zod: 3.22.0
✅ Babel Config: Fixed with reanimated plugin
✅ Cache: Cleared
```

---

## 🔍 DEBUG COMMANDS:

```powershell
# Check if Metro running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Kill Metro if stuck
taskkill /F /IM node.exe

# Check current directory
Get-Location

# Verify package.json exists
Test-Path C:\BabyGrow\mobile-app\package.json

# Check installed packages
cd C:\BabyGrow\mobile-app
npm list --depth=0
```

---

## 📞 JIKA MASIH BERMASALAH:

1. Screenshot error message lengkap
2. Copy text dari Metro Bundler terminal
3. Kirim info:
   - Versi HP Android
   - WiFi atau Cellular
   - Error yang muncul

---

**Last Updated:** January 24, 2026
**Status:** Metro Bundler RUNNING dengan cache cleared dan reanimated plugin installed
