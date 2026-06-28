# ⚡ Quick Build APK - 3 Steps

## 🎯 Metode Tercepat: EAS Build

### Step 1: Install & Login
```powershell
npm install -g eas-cli
eas login
```

### Step 2: Build APK
```powershell
cd C:\BabyGrow\mobile-app
eas build --profile development --platform android
```

### Step 3: Download & Install
1. Klik link yang muncul
2. Download APK (~50-80 MB)
3. Transfer ke HP Android
4. Install APK
5. Buka app → Connect ke BabyGrow_Alat ✅

---

## 📱 Atau Jalankan Script

```powershell
cd C:\BabyGrow\mobile-app
.\BUILD-CUSTOM-APK.ps1
```

Script akan guide step-by-step!

---

## ⏱️ Waktu:
- Install EAS CLI: ~1 menit
- Login: ~1 menit  
- Build: ~20 menit ⏳
- Download & Install: ~5 menit

**Total: ~27 menit**

---

## ✅ Setelah Install

Custom APK installed → BLEService.ts auto-detect → Real BLE enabled → Bisa pair dengan ESP32!

**Test:**
1. Buka app (custom APK)
2. Tap "Ukur Otomatis"
3. Tap "Pair dengan Alat"
4. **"BabyGrow_Alat" akan muncul** ✅
5. Connect → Stream data real!

---

**Baca panduan lengkap:** `PANDUAN-BUILD-APK.md`
