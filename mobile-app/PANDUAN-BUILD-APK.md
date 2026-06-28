# 🏗️ Panduan Build Custom APK BabyGrow

## ⚠️ Kenapa Butuh Custom APK?

**Expo Go TIDAK bisa akses BLE hardware!**

```
❌ Expo Go:
   - Hanya mock mode (data palsu)
   - react-native-ble-plx tidak berfungsi
   - Tidak bisa pair dengan ESP32 real

✅ Custom APK:
   - Real BLE support
   - Bisa connect ke BabyGrow_Alat
   - Bisa baca sensor height & weight
```

---

## 🚀 Metode 1: EAS Build (RECOMMENDED)

### Kelebihan:
- ✅ Tidak butuh Android Studio
- ✅ Build di cloud (gratis)
- ✅ Cepat & mudah
- ✅ Download APK langsung

### Langkah-langkah:

#### 1. Install EAS CLI

```powershell
npm install -g eas-cli
```

#### 2. Login ke Expo

```powershell
eas login
```

Jika belum punya account:
- Buka https://expo.dev/signup
- Daftar gratis dengan email
- Verifikasi email
- Login dengan `eas login`

#### 3. Konfigurasi Project

```powershell
cd C:\BabyGrow\mobile-app
eas build:configure
```

Akan create file `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

#### 4. Start Build

```powershell
eas build --profile development --platform android
```

**Output:**
```
✔ Select a build profile: › development
✔ Linked to project @yourusername/babygrow-app
✔ Build in progress...

Build URL: https://expo.dev/accounts/...

⏱️  ETA: ~20 minutes
```

#### 5. Download APK

Setelah build selesai (~20 menit):
1. **Klik link** yang muncul di terminal
2. **Download APK** (file ~50-80 MB)
3. **Transfer ke HP** via USB/email/drive
4. **Install APK** di HP Android

---

## 📱 Install APK di Android

### Step 1: Enable Install dari Unknown Sources

**Android 8.0+:**
1. Settings → Apps
2. Special app access
3. Install unknown apps
4. Pilih browser/file manager yang akan dipakai
5. Allow from this source ✅

**Android 7.0 atau lebih lama:**
1. Settings → Security
2. Unknown sources ✅

### Step 2: Install APK

1. **Buka File Manager** di HP
2. **Navigate** ke file APK yang didownload
3. **Tap APK** → Install
4. **Open** setelah install selesai

### Step 3: Test BLE Connection

1. **Buka BabyGrow app** (custom APK, bukan Expo Go!)
2. **Pastikan ESP32 running** (Serial Monitor: "✅ BLE Server Ready!")
3. **Login** ke app
4. **Tap "Ukur Otomatis"**
5. **Tap "Pair dengan Alat"**
6. **Device "BabyGrow_Alat" akan muncul** ✅
7. **Tap untuk connect**
8. **Data real dari sensor** akan stream!

---

## 🛠️ Metode 2: Local Build (Advanced)

### Prerequisites:

✅ **Android Studio** installed
✅ **Android SDK** (API 31+)
✅ **Java JDK** (11+)
✅ **ANDROID_HOME** env variable set
✅ **HP Android** connected via USB
✅ **USB Debugging** enabled

### Langkah-langkah:

#### 1. Install Android Studio

Download: https://developer.android.com/studio

Install components:
- Android SDK
- Android SDK Platform (API 31)
- Android SDK Build-Tools
- Android Emulator (optional)

#### 2. Setup Environment

Set ANDROID_HOME:
```powershell
# Windows PowerShell (as Administrator)
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'Machine')
```

Add to PATH:
```
C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
C:\Users\YourName\AppData\Local\Android\Sdk\tools
```

#### 3. Enable USB Debugging di HP

1. Settings → About phone
2. Tap "Build number" 7x (Developer mode enabled)
3. Settings → Developer options
4. USB debugging ✅

#### 4. Connect HP via USB

```powershell
adb devices
```

Output:
```
List of devices attached
ABC123456789    device
```

#### 5. Prebuild Native Code

```powershell
cd C:\BabyGrow\mobile-app
npx expo prebuild --clean
```

Ini akan generate folder:
- `android/` - Android native code
- `ios/` - iOS native code (ignore untuk sekarang)

#### 6. Build & Install

```powershell
npx expo run:android
```

Proses:
- Download Gradle dependencies (~5-10 menit pertama kali)
- Build APK (~10-20 menit)
- Install ke HP via USB
- Launch app automatically

**Output:**
```
> Task :app:installDebug
Installing APK 'app-debug.apk' on 'Pixel 4 - 11'
Installed on 1 device.

BUILD SUCCESSFUL in 15m 32s
```

---

## 🔍 Troubleshooting

### ❌ "eas command not found"

**Solution:**
```powershell
npm install -g eas-cli
# Atau
npm install -g @expo/eas-cli
```

Restart terminal setelah install.

### ❌ "Build failed: Expo account required"

**Solution:**
```powershell
eas login
```

Buat account di https://expo.dev/signup jika belum punya.

### ❌ "ANDROID_HOME is not set"

**Solution:**
```powershell
# Check current value
$env:ANDROID_HOME

# Set permanently (as Administrator)
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'Machine')

# Restart PowerShell
```

### ❌ "No Android devices found"

**Solution:**
1. Connect HP via USB
2. Enable USB Debugging
3. Check connection:
   ```powershell
   adb devices
   ```
4. Jika "unauthorized", allow di HP
5. Unplug/replug USB cable

### ❌ "Gradle build failed"

**Solution:**
```powershell
# Clear cache
cd android
.\gradlew clean

# Try build again
cd ..
npx expo run:android
```

### ❌ "APK tidak bisa install di HP"

**Solution:**
1. Enable "Install unknown apps"
2. Uninstall versi Expo Go jika ada
3. Restart HP
4. Install lagi

### ❌ "App crash saat dibuka"

**Solution:**
1. Check logcat:
   ```powershell
   adb logcat | Select-String "BabyGrow"
   ```
2. Clear app data:
   - Settings → Apps → BabyGrow → Clear data
3. Reinstall APK

### ❌ "BLE masih tidak detect device"

**Cek:**
1. ✅ Ini custom APK (bukan Expo Go)
2. ✅ Bluetooth HP aktif
3. ✅ Location permission granted
4. ✅ ESP32 running (Serial Monitor check)
5. ✅ ESP32 dekat HP (<2 meter)

**Test dengan nRF Connect:**
1. Download "nRF Connect for Mobile"
2. Scan → Should see "BabyGrow_Alat"
3. Jika nRF bisa detect tapi app tidak → Reinstall APK

---

## 📊 Perbandingan Metode Build

| Feature | EAS Build | Local Build |
|---------|-----------|-------------|
| **Perlu Android Studio** | ❌ Tidak | ✅ Ya |
| **Perlu Expo Account** | ✅ Ya (gratis) | ❌ Tidak |
| **Build Time** | ~20 menit | ~15-30 menit |
| **Disk Space** | ~100 MB | ~10 GB |
| **Internet Required** | ✅ Ya | Hanya download deps |
| **HP Connect via USB** | ❌ Tidak | ✅ Ya (untuk install) |
| **Kemudahan** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Advanced |
| **Recommended** | ✅ **YES** | Jika EAS gagal |

---

## ✅ Checklist Build APK

### Sebelum Build:
- [ ] Node.js installed (v18+)
- [ ] npm atau yarn installed
- [ ] Internet connection stabil
- [ ] Expo account (untuk EAS)

### EAS Build Checklist:
- [ ] `npm install -g eas-cli` success
- [ ] `eas login` success
- [ ] `eas build:configure` done
- [ ] `eas build --profile development --platform android` running
- [ ] Build URL received
- [ ] APK downloaded
- [ ] APK transferred ke HP

### Local Build Checklist:
- [ ] Android Studio installed
- [ ] Android SDK installed (API 31+)
- [ ] ANDROID_HOME set correctly
- [ ] HP connected via USB
- [ ] USB Debugging enabled
- [ ] `adb devices` shows device
- [ ] `npx expo prebuild` success
- [ ] `npx expo run:android` success
- [ ] App installed on phone

### Setelah Install:
- [ ] Custom APK installed (BUKAN Expo Go)
- [ ] Bluetooth permission granted
- [ ] Location permission granted
- [ ] ESP32 running (Serial Monitor check)
- [ ] App opened tanpa crash
- [ ] Login berhasil
- [ ] "Ukur Otomatis" → "Pair dengan Alat" accessible
- [ ] "BabyGrow_Alat" terdeteksi ✅
- [ ] Connect berhasil ✅
- [ ] Data height/weight streaming ✅

---

## 🎯 Next Steps Setelah APK Installed

1. **Install Libraries di ESP32** (jika belum):
   ```
   Arduino IDE → Library Manager
   - VL53L1X by Pololu
   - HX711 Arduino Library
   ```

2. **Wire Sensors ke ESP32**:
   - VL53L1X: SDA→GPIO21, SCL→GPIO22
   - HX711: DT→GPIO14, SCK→GPIO13
   - Battery: GPIO35 (optional)

3. **Kalibrasi Sensors**:
   - HX711: Tare + calibration dengan beban diketahui
   - VL53L1X: Set SENSOR_MOUNT_HEIGHT

4. **Test End-to-End**:
   - Place baby on scale
   - Position under sensor
   - Tap "Mulai Ukur" di app
   - Verify measurements accurate

---

## 📞 Butuh Bantuan?

**Jika build gagal:**
1. Screenshot error message
2. Check troubleshooting section
3. Try alternative method (EAS vs Local)
4. Clear cache dan try again

**Common Errors:**
- Build failed → Check internet, try `--clear-cache`
- Login failed → Verify email, reset password
- ANDROID_HOME not set → Reinstall Android Studio
- Device not found → Check USB cable, enable debugging

---

## 🚀 Quick Commands Reference

```powershell
# EAS Build (Recommended)
npm install -g eas-cli
eas login
cd C:\BabyGrow\mobile-app
eas build:configure
eas build --profile development --platform android

# Local Build
cd C:\BabyGrow\mobile-app
npx expo prebuild --clean
npx expo run:android

# Check Android device
adb devices

# Install APK manually
adb install path/to/app.apk

# View logs
adb logcat | Select-String "BabyGrow"
```

---

**STATUS SAAT INI:**
- ✅ ESP32 firmware uploaded & running
- ✅ BLE broadcasting "BabyGrow_Alat"
- ✅ Tested dengan nRF Connect
- ⏳ **SEDANG BUILD CUSTOM APK** ← You are here
- ⏳ Install APK di HP
- ⏳ Test real BLE connection
- ⏳ Install sensor libraries (VL53L1X, HX711)
- ⏳ Wire physical sensors
- ⏳ Calibrate & end-to-end test

**NEXT:** Run `.\BUILD-CUSTOM-APK.ps1` untuk mulai build!
